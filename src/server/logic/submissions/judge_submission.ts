import { db } from "db";
import type {
  JudgeChecker,
  JudgeScript,
  JudgeSubmission,
  JudgeSubtaskBatch,
  JudgeSubtaskCommunication,
  JudgeSubtaskOutput,
  JudgeTask,
} from "common/types/judge";
import { JudgeFiles } from "server/logic/judgements/judge_files";
import { JudgeRunner } from "server/logic/judgements/judge_runner";
import { CheckerKind, Language, TaskType } from "common/types/constants";
import { Transaction } from "kysely";
import { Models } from "common/types";
import { TaskConfigurationError, UnreachableError } from "common/errors";

export async function judgeSubmission(submissionId: string) {
  const [submission, task] = await db.transaction().execute(async (trx) => {
    const sub = await loadSubmission(trx, submissionId);
    const tsk = await loadTask(trx, sub.task_id);
    return [sub, tsk];
  });

  let tTaskRoot: string | null = null;
  let tOutputRoot: string | null = null;
  let tSubmissionRoot: string | null = null;
  try {
    const pTask = JudgeFiles.setupTask(task).then((newTaskRoot) => {
      tTaskRoot = newTaskRoot;
      return newTaskRoot;
    });
    const pOutput = JudgeFiles.setupOutput(submission).then((newOutputRoot) => {
      tOutputRoot = newOutputRoot;
      return newOutputRoot;
    });
    const pSubmission = JudgeFiles.setupSubmission(submission).then((newSubmissionRoot) => {
      tSubmissionRoot = newSubmissionRoot;
      return newSubmissionRoot;
    });
    const [taskRoot, outputRoot, submissionRoot] = await Promise.all([pTask, pOutput, pSubmission]);
    await JudgeRunner.evaluate(task, submission, taskRoot, outputRoot, submissionRoot);
  } finally {
    // Don't clean up judge root
    // if (tSubmissionRoot != null) {
    //   await JudgeFiles.cleanDirectory(tSubmissionRoot);
    // }
    // if (tOutputRoot != null) {
    //   await JudgeFiles.cleanDirectory(tOutputRoot);
    // }
  }
}

async function loadSubmission(
  trx: Transaction<Models>,
  submissionId: string
): Promise<JudgeSubmission> {
  const dbsub = await trx
    .selectFrom("submissions")
    .select(["id", "task_id", "user_id", "contest_id", "language"])
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
    user_id: dbsub.user_id,
    contest_id: dbsub.contest_id,
    language: dbsub.language as Language,
    files: files,
  };
}

async function loadTask(trx: Transaction<Models>, taskId: string): Promise<JudgeTask> {
  const task = await trx
    .selectFrom("tasks")
    .where("id", "=", taskId)
    .select([
      "tasks.type",
      "tasks.checker_kind",
      "tasks.checker_id",
      "tasks.communicator_id",
      "tasks.time_limit_ms",
      "tasks.memory_limit_byte",
      "tasks.compile_time_limit_ms",
      "tasks.compile_memory_limit_byte",
    ])
    .executeTakeFirstOrThrow();

  const dbScripts = await trx
    .selectFrom("task_scripts")
    .where("task_id", "=", taskId)
    .select(["id", "language", "file_name", "file_hash", "argv"])
    .execute();

  const scripts: JudgeScript[] = dbScripts.map((script) => ({
    id: script.id,
    language: script.language,
    file_name: script.file_name,
    file_hash: script.file_hash,
    argv: script.argv ?? [],
    exe_name: null,
  }));

  if (task.type === TaskType.Batch) {
    const subtasks = await loadSubtasksBatch(trx, taskId);
    return {
      id: taskId,
      type: task.type,
      subtasks: subtasks,
      checker: makeChecker({
        task_id: taskId,
        kind: task.checker_kind,
        checker_id: task.checker_id,
        scripts,
      }),
      scripts,
      time_limit_ms: task.time_limit_ms,
      memory_limit_byte: task.memory_limit_byte,
      compile_time_limit_ms: task.compile_time_limit_ms,
      compile_memory_limit_byte: task.compile_memory_limit_byte,
    };
  } else if (task.type === TaskType.Communication) {
    const subtasks = await loadSubtasksCommunication(trx, taskId);
    return {
      id: taskId,
      type: task.type,
      subtasks: subtasks,
      checker: makeChecker({
        task_id: taskId,
        kind: task.checker_kind,
        checker_id: task.checker_id,
        scripts,
      }),
      communicator: findScript({
        task_id: taskId,
        script_id: task.communicator_id,
        scripts,
      }),
      scripts,
      time_limit_ms: task.time_limit_ms,
      memory_limit_byte: task.memory_limit_byte,
      compile_time_limit_ms: task.compile_time_limit_ms,
      compile_memory_limit_byte: task.compile_memory_limit_byte,
    };
  } else if (task.type === TaskType.OutputOnly) {
    const subtasks = await loadSubtasksOutput(trx, taskId);
    return {
      id: taskId,
      type: task.type,
      subtasks: subtasks,
      checker: makeChecker({
        task_id: taskId,
        kind: task.checker_kind,
        checker_id: task.checker_id,
        scripts,
      }),
      scripts,
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

async function loadSubtasksCommunication(
  trx: Transaction<Models>,
  taskId: string
): Promise<JudgeSubtaskCommunication[]> {
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

type CheckerOpts = {
  task_id: string;
  kind: CheckerKind;
  checker_id: string | null;
  scripts: JudgeScript[];
};

function makeChecker(opts: CheckerOpts): JudgeChecker {
  if (opts.kind !== CheckerKind.Custom) {
    return { kind: opts.kind };
  }
  return {
    kind: opts.kind,
    script: findScript({
      task_id: opts.task_id,
      script_id: opts.checker_id,
      scripts: opts.scripts,
    }),
  };
}

type FindScriptOpts = {
  task_id: string;
  script_id: string | null;
  scripts: JudgeScript[];
};

function findScript(opts: FindScriptOpts): JudgeScript {
  const script = opts.scripts.find((s) => s.id === opts.script_id);
  if (script == null) {
    throw new TaskConfigurationError(opts.task_id, "Missing checker script");
  }
  return script;
}
