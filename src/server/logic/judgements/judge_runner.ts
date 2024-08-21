import { Language, Verdict } from "common/types/constants";
import {
  JudgeSubmission,
  JudgeSubtask,
  JudgeTask,
  JudgeTaskData,
  JudgeVerdict,
  JudgeVerdictSubtask,
  JudgeVerdictTaskData,
} from "common/types/judge";
import { db } from "db";
import { CompilationResult, EvaluationContext } from "server/evaluation";
import {
  compileSubmission,
  evaluateTaskData,
  GoJudgeEvaluationContext,
} from "server/evaluation/go-judge";

export class JudgeRunner {
  static async evaluate(
    task: JudgeTask,
    submission: JudgeSubmission,
    taskDir: string,
    submissionDir: string
  ): Promise<JudgeVerdict> {
    const compilation = await compileSubmission(task, submission, taskDir, submissionDir);
    const verdict = await runTask(compilation, task, submission);
    return verdict;
  }
}

async function runTask(
  compilation: CompilationResult<GoJudgeEvaluationContext>,
  task: JudgeTask,
  submission: JudgeSubmission
): Promise<JudgeVerdict> {
  const dbVerdict = await db.transaction().execute(async (trx) => {
    const trxVerdict = await trx
      .insertInto("verdicts")
      .values({
        submission_id: submission.id,
        is_official: true,
        compile_memory_byte: compilation.compile_memory_byte,
        compile_time_ms: compilation.compile_time_ms,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    await trx
      .updateTable("submissions")
      .set({
        official_verdict_id: trxVerdict.id,
      })
      .where("id", "=", submission.id)
      .execute();

    return trxVerdict;
  });

  const allVerdictSubtasks: JudgeVerdictSubtask[] = [];
  let verdict: Verdict = Verdict.Accepted;
  let raw_score = 1;
  let running_time_ms = 0;
  let running_memory_byte = 0;

  for (const subtask of task.subtasks) {
    const child = await runSubtask(compilation.context, dbVerdict.id, subtask);
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
  context: GoJudgeEvaluationContext,
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
  context: GoJudgeEvaluationContext,
  verdict_subtask_id: string,
  task_data: JudgeTaskData
): Promise<JudgeVerdictTaskData> {
  const result = await evaluateTaskData(context, task_data);

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
