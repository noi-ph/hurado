import fs from "fs";
import path from "path";
import { Language, Verdict } from "common/types/constants";
import { getLanguageFilename } from "./judge_files";
import {
  JudgeSubmission,
  JudgeSubtask,
  JudgeTask,
  JudgeTaskData,
  JudgeVerdict,
  JudgeVerdictSubtask,
  JudgeVerdictTaskData,
} from "./judge_types";
import { db } from "db";

export class JudgeRunner {
  static async evaluate(
    task: JudgeTask,
    submission: JudgeSubmission,
    taskDir: string,
    submissionDir: string
  ): Promise<JudgeVerdict> {
    const mainFilename = getLanguageFilename(submission.language as Language);
    const context: JudgeContext = {
      executable: path.join(submissionDir, mainFilename),
      submission_root: submissionDir,
      judge_root: taskDir,
    };
    const verdict = await runTask(context, task, submission);
    return verdict;
  }
}

async function runTask(
  context: JudgeContext,
  task: JudgeTask,
  submission: JudgeSubmission
): Promise<JudgeVerdict> {
  const dbVerdict = await db.transaction().execute(async (trx) => {
    const verd = await trx
      .insertInto("verdicts")
      .values({
        submission_id: submission.id,
        is_official: true,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    await trx
      .updateTable("submissions")
      .set({
        official_verdict_id: verd.id,
      })
      .execute();

    return verd;
  });

  const allVerdictSubtasks: JudgeVerdictSubtask[] = [];
  let verdict: Verdict = Verdict.Accepted;
  let raw_score = 1;
  let running_time_ms = 0;
  let running_memory_byte = 0;

  for (const subtask of task.subtasks) {
    const child = await runSubtask(context, dbVerdict.id, subtask);
    allVerdictSubtasks.push(child);

    running_memory_byte = Math.max(running_memory_byte, child.running_memory_byte);
    running_time_ms = Math.max(running_time_ms, child.running_time_ms);
    if (child.verdict != Verdict.Accepted) {
      verdict = child.verdict;
      raw_score = 0;
      break;
    }
  }

  await db
    .updateTable("verdicts")
    .set({
      verdict: verdict,
      raw_score: raw_score,
      running_time_ms: running_time_ms,
      running_memory_byte: running_memory_byte,
    })
    .where("id", "=", dbVerdict.id)
    .returning(["id"])
    .execute();

  return {
    id: dbVerdict.id,
    submission_id: submission.id,
    created_at: dbVerdict.created_at,
    is_official: true,
    verdict: verdict,
    raw_score: raw_score,
    running_time_ms: running_time_ms,
    running_memory_byte: running_memory_byte,
    subtasks: allVerdictSubtasks,
  };
}

async function runSubtask(
  context: JudgeContext,
  verdict_id: string,
  subtask: JudgeSubtask
): Promise<JudgeVerdictSubtask> {
  const dbSubtask = await db
    .insertInto("verdict_subtasks")
    .values({
      subtask_id: subtask.id,
      verdict_id: verdict_id,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  const allVerdictData: JudgeVerdictTaskData[] = [];
  let verdict: Verdict = Verdict.Accepted;
  let raw_score = 1;
  let running_time_ms = 0;
  let running_memory_byte = 0;

  for (const data of subtask.data) {
    const child = await runTestData(context, dbSubtask.id, data);
    allVerdictData.push(child);

    running_memory_byte = Math.max(running_memory_byte, child.running_memory_byte);
    running_time_ms = Math.max(running_time_ms, child.running_time_ms);
    if (child.verdict != Verdict.Accepted) {
      verdict = child.verdict;
      raw_score = 0;
      break;
    }
  }

  await db
    .updateTable("verdict_subtasks")
    .set({
      verdict: verdict,
      raw_score: raw_score,
      running_time_ms: running_time_ms,
      running_memory_byte: running_memory_byte,
    })
    .where("id", "=", dbSubtask.id)
    .returning(["id"])
    .execute();

  return {
    id: dbSubtask.id,
    subtask_id: subtask.id,
    created_at: dbSubtask.created_at,
    verdict: verdict,
    raw_score: raw_score,
    running_time_ms: running_time_ms,
    running_memory_byte: running_memory_byte,
    data: allVerdictData,
  };
}

async function runTestData(
  context: JudgeContext,
  verdict_subtask_id: string,
  task_data: JudgeTaskData
): Promise<JudgeVerdictTaskData> {
  const result = await actuallyRunTestData(context, task_data);

  const dbTaskData = await db
    .insertInto("verdict_task_data")
    .values({
      verdict_subtask_id: verdict_subtask_id,
      task_data_id: task_data.id,
      verdict: result.verdict,
      raw_score: result.raw_score,
      running_time_ms: result.running_time_ms,
      running_memory_byte: result.running_memory_byte,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  return {
    id: dbTaskData.id,
    task_data_id: task_data.id,
    created_at: dbTaskData.created_at,
    verdict: result.verdict,
    raw_score: result.raw_score,
    running_time_ms: result.running_time_ms,
    running_memory_byte: result.running_memory_byte,
  };
}

async function actuallyRunTestData(context: JudgeContext, data: JudgeTaskData): Promise<RunResult> {
  let verdict: Verdict = Verdict.Accepted;
  let raw_score = 1;
  let running_time_ms = 0;
  let running_memory_byte = 0;

  const fileContent = await fs.promises.readFile(context.executable, "utf8");
  if (!fileContent.includes("please")) {
    verdict = Verdict.WrongAnswer;
    raw_score = 0;
    running_time_ms = 1234;
    running_memory_byte = 5678;
  }

  return {
    verdict,
    raw_score,
    running_time_ms,
    running_memory_byte,
  };
}

type JudgeContext = {
  executable: string;
  submission_root: string;
  judge_root: string;
};

type RunResult = {
  verdict: Verdict;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
};
