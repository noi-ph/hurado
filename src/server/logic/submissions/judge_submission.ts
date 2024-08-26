import { db } from "db";
import type {
  JudgeChecker,
  JudgeSubmission,
  JudgeSubtaskBatch,
  JudgeSubtaskOutput,
  JudgeTask,
} from "common/types/judge";
import { JudgeFiles } from "server/logic/judgements/judge_files";
import { JudgeRunner } from "server/logic/judgements/judge_runner";
import { CheckerKind, JudgeLanguage, Language, TaskType } from "common/types/constants";
import { Transaction } from "kysely";
import { Models } from "common/types";
import { NotYetImplementedError, TaskConfigurationError, UnreachableError } from "common/errors";

export async function judgeSubmission(submissionId: string) {
  const [submission, task] = await db.transaction().execute(async (trx) => {
    const sub = await loadSubmission(trx, submissionId);
    const tsk = await loadTask(trx, sub.task_id);
    return [sub, tsk];
  });

  const pTaskDir = JudgeFiles.setupDirectory();
  const pSubDir = JudgeFiles.setupDirectory();
  const [taskDir, subDir] = await Promise.all([pTaskDir, pSubDir]);
  try {
    await Promise.all([
      JudgeFiles.setupTask(task, taskDir),
      JudgeFiles.setupSubmission(submission, subDir),
    ]);
    await JudgeRunner.evaluate(task, submission, taskDir, subDir);
  } finally {
    await Promise.all([JudgeFiles.cleanDirectory(taskDir), JudgeFiles.cleanDirectory(subDir)]);
  }
}

async function loadSubmission(
  trx: Transaction<Models>,
  submissionId: string
): Promise<JudgeSubmission> {
  const dbsub = await trx
    .selectFrom("submissions")
    .select(["id", "task_id", "language"])
    .where("id", "=", submissionId)
    .executeTakeFirstOrThrow();

  const files = await trx
    .selectFrom("submission_files")
    .select(["file_name", "hash"])
    .where("submission_id", "=", submissionId)
    .execute();

  return {
    id: dbsub.id,
    task_id: dbsub.task_id,
    language: dbsub.language as Language,
    files: files,
  };
}

async function loadTask(trx: Transaction<Models>, taskId: string): Promise<JudgeTask> {
  const task = await trx
    .selectFrom("tasks")
    .where("id", "=", taskId)
    .leftJoin("task_scripts as checker_scripts", "checker_scripts.id", "tasks.checker_id")
    .select([
      "tasks.type",
      "tasks.checker_kind",
      "checker_scripts.language as checker_language",
      "checker_scripts.file_name as checker_file_name",
      "checker_scripts.file_hash as checker_file_hash",
      "checker_scripts.argv as checker_argv",
    ])
    .executeTakeFirstOrThrow();

  if (task.type === TaskType.Batch) {
    const subtasks = await loadSubtasksBatch(trx, taskId);
    return {
      type: task.type,
      subtasks: subtasks,
      checker: makeChecker({
        task_id: taskId,
        kind: task.checker_kind,
        language: task.checker_language,
        file_hash: task.checker_file_hash,
        argv: task.checker_argv,
      }),
    };
  } else if (task.type === TaskType.Communication) {
    throw new NotYetImplementedError(task.type);
  } else if (task.type === TaskType.OutputOnly) {
    const subtasks = await loadSubtasksOutput(trx, taskId);
    return {
      type: task.type,
      subtasks: subtasks,
      checker: makeChecker({
        task_id: taskId,
        kind: task.checker_kind,
        language: task.checker_language,
        file_hash: task.checker_file_hash,
        argv: task.checker_argv,
      }),
    };
  } else {
    throw new UnreachableError(task.type);
  }
}

async function loadSubtasksBatch(
  trx: Transaction<Models>,
  taskId: string
): Promise<JudgeSubtaskBatch[]> {
  const rawSubtasks = await trx
    .selectFrom("task_subtasks")
    .select(["id", "score_max"])
    .where("task_id", "=", taskId)
    .orderBy("order")
    .execute();

  const subtaskIds = rawSubtasks.map((s) => s.id);
  const rawData =
    subtaskIds.length <= 0
      ? []
      : await trx
          .selectFrom("task_data")
          .select([
            "id",
            "subtask_id",
            "input_file_name",
            "input_file_hash",
            "judge_file_name",
            "judge_file_hash",
          ])
          .where("subtask_id", "in", subtaskIds)
          .orderBy(["subtask_id", "order"])
          .execute();

  return rawSubtasks.map((subtask) => ({
    id: subtask.id,
    score_max: subtask.score_max,
    data: rawData
      .filter((d) => d.subtask_id == subtask.id)
      .map((d) => ({
        id: d.id,
        input_file_name: d.input_file_name as string,
        input_file_hash: d.input_file_hash as string,
        judge_file_name: d.judge_file_name,
        judge_file_hash: d.judge_file_hash,
      })),
  }));
}

async function loadSubtasksOutput(
  trx: Transaction<Models>,
  taskId: string
): Promise<JudgeSubtaskOutput[]> {
  const rawSubtasks = await trx
    .selectFrom("task_subtasks")
    .select(["id", "score_max"])
    .where("task_id", "=", taskId)
    .orderBy("order")
    .execute();

  const subtaskIds = rawSubtasks.map((s) => s.id);
  const rawData =
    subtaskIds.length <= 0
      ? []
      : await trx
          .selectFrom("task_data")
          .select(["id", "subtask_id", "judge_file_name", "judge_file_hash"])
          .where("subtask_id", "in", subtaskIds)
          .orderBy(["subtask_id", "order"])
          .execute();

  return rawSubtasks.map((subtask) => ({
    id: subtask.id,
    score_max: subtask.score_max,
    data: rawData
      .filter((d) => d.subtask_id == subtask.id)
      .map((d) => ({
        id: d.id,
        judge_file_name: d.judge_file_name,
        judge_file_hash: d.judge_file_hash,
      })),
  }));
}

type CheckerOpts = {
  task_id: string;
  kind: CheckerKind;
  language: JudgeLanguage | null;
  file_hash: string | null;
  argv: string[] | null;
};

function makeChecker(opts: CheckerOpts): JudgeChecker {
  if (opts.kind !== CheckerKind.Custom) {
    return { kind: opts.kind };
  }
  if (opts.language == null || opts.file_hash == null) {
    throw new TaskConfigurationError(opts.task_id, "Missing checker script");
  }
  return {
    kind: opts.kind,
    script: {
      language: opts.language,
      file_hash: opts.file_hash,
      argv: opts.argv ?? [],
    },
  };
}
