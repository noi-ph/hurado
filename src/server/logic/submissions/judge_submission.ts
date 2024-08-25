import { db } from "db";
import type {
  JudgeSubmission,
  JudgeSubtaskBatch,
  JudgeSubtaskOutput,
  JudgeTask,
} from "common/types/judge";
import { JudgeFiles } from "server/logic/judgements/judge_files";
import { JudgeRunner } from "server/logic/judgements/judge_runner";
import { Language, TaskType } from "common/types/constants";
import { Transaction } from "kysely";
import { Models } from "common/types";
import { NotYetImplementedError, UnreachableError } from "common/errors";

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
    .select("type")
    .where("id", "=", taskId)
    .executeTakeFirstOrThrow();

  if (task.type === TaskType.Batch) {
    const subtasks = await loadSubtasksBatch(trx, taskId);
    return {
      type: task.type,
      subtasks: subtasks,
    };
  } else if (task.type === TaskType.Communication) {
    throw new NotYetImplementedError(task.type);
  } else if (task.type === TaskType.OutputOnly) {
    const subtasks = await loadSubtasksOutput(trx, taskId);
    return {
      type: task.type,
      subtasks: subtasks,
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
            "output_file_name",
            "output_file_hash",
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
        output_file_name: d.output_file_name,
        output_file_hash: d.output_file_hash,
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
          .select([
            "id",
            "subtask_id",
            "output_file_name",
            "output_file_hash",
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
        output_file_name: d.output_file_name,
        output_file_hash: d.output_file_hash,
        judge_file_name: d.judge_file_name,
        judge_file_hash: d.judge_file_hash,
      })),
  }));
}
