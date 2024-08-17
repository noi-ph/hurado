import { db } from "db";
import { JudgeVerdict, JudgeSubmission, JudgeSubtask, JudgeTask } from "server/logic/judgements/judge_types";
import { JudgeFiles } from "server/logic/judgements/judge_files";
import { JudgeRunner } from "server/logic/judgements/judge_runner";

export async function judgeSubmission(submissionId: string) {
  const submission: JudgeSubmission = await db
    .selectFrom("submissions")
    .select(["id", "task_id", "file_hash", "language", "runtime_args"])
    .where("id", "=", submissionId)
    .executeTakeFirstOrThrow();
  const task = await loadTask(submission.task_id);

  const pTaskDir = JudgeFiles.setupDirectory();
  const pSubDir = JudgeFiles.setupDirectory();
  const [taskDir, subDir] = await Promise.all([pTaskDir, pSubDir]);
  try {
    await Promise.all([
      JudgeFiles.setupTask(task, taskDir),
      JudgeFiles.setupSubmission(submission, subDir),
    ]);
    const verdict = await JudgeRunner.evaluate(task, submission, taskDir, subDir);
    saveResults(submission, verdict);
  } finally {
    await Promise.all([JudgeFiles.cleanDirectory(taskDir), JudgeFiles.cleanDirectory(subDir)]);
  }
}

async function loadTask(taskId: string): Promise<JudgeTask> {
  const subtasks: JudgeSubtask[] = await db.transaction().execute(async (trx) => {
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
          input_file_name: d.input_file_name,
          input_file_hash: d.input_file_hash,
          output_file_name: d.output_file_name,
          output_file_hash: d.output_file_hash,
          judge_file_name: d.judge_file_name,
          judge_file_hash: d.judge_file_hash,
        })),
    }));
  });

  return {
    subtasks: subtasks,
  };
}

async function saveResults(submission: JudgeSubmission, result: JudgeVerdict): Promise<void> {
}
