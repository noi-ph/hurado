import fs from "fs";
import { UnreachableError } from "common/errors";
import { ProgrammingLanguage, TaskType, Verdict } from "common/types/constants";
import {
  JudgeSubmission,
  JudgeSubtaskBatch,
  JudgeSubtaskCommunication,
  JudgeSubtaskOutput,
  JudgeTask,
  JudgeTaskBatch,
  JudgeTaskCommunication,
  JudgeTaskDataBatch,
  JudgeTaskDataCommunication,
  JudgeTaskDataOutput,
  JudgeTaskOutput,
  JudgeVerdict,
  JudgeVerdictSubtask,
  JudgeVerdictTaskData,
} from "common/types/judge";
import { db } from "db";
import {
  CompilationResult,
  compileSubmission,
  evaluateTaskDataForBatch,
  evaluateTaskDataForCommunication,
  evaluateTaskDataForOutput,
  EvaluationResult,
  JudgeEvaluationContextBatch,
  JudgeEvaluationContextCommunication,
  JudgeEvaluationContextOutput,
} from "server/evaluation";

export class JudgeRunner {
  static async evaluate(
    task: JudgeTask,
    submission: JudgeSubmission,
    taskRoot: string,
    outputRoot: string,
    submissionRoot: string
  ): Promise<JudgeVerdict> {
    switch (task.type) {
      case TaskType.Batch: {
        const compilation = await compileSubmission(submission, submissionRoot);
        const context: JudgeEvaluationContextBatch = {
          task_root: taskRoot,
          output_root: outputRoot,
          submission_root: submissionRoot,
          contestant: {
            language: submission.language as ProgrammingLanguage,
            exe_name: compilation.exe_name,
          },
          checker: task.checker,
        };
        return judgeTask(task.type, context, compilation, task, submission);
      }
      case TaskType.OutputOnly: {
        const context: JudgeContextFor<TaskType.OutputOnly> = {
          task_root: taskRoot,
          submission_root: submissionRoot,
          checker: task.checker,
        };
        return judgeTask(task.type, context, null, task, submission);
      }
      case TaskType.Communication: {
        const compilation = await compileSubmission(submission, submissionRoot);
        const context: JudgeEvaluationContextCommunication = {
          task_root: taskRoot,
          output_root: outputRoot,
          submission_root: submissionRoot,
          contestant: {
            language: submission.language as ProgrammingLanguage,
            exe_name: compilation.exe_name,
          },
          communicator: task.communicator,
          checker: task.checker,
        };
        return judgeTask(task.type, context, compilation, task, submission);
      }
      default:
        throw new UnreachableError(task);
    }
  }
}

type JudgeContextFor<Type extends TaskType> = {
  [TaskType.Batch]: JudgeEvaluationContextBatch;
  [TaskType.OutputOnly]: JudgeEvaluationContextOutput;
  [TaskType.Communication]: JudgeEvaluationContextCommunication;
}[Type];

type JudgeTaskFor<Type extends TaskType> = {
  [TaskType.Batch]: JudgeTaskBatch;
  [TaskType.OutputOnly]: JudgeTaskOutput;
  [TaskType.Communication]: JudgeTaskCommunication;
}[Type];

type JudgeSubtaskFor<Type extends TaskType> = {
  [TaskType.Batch]: JudgeSubtaskBatch;
  [TaskType.OutputOnly]: JudgeSubtaskOutput;
  [TaskType.Communication]: JudgeSubtaskCommunication;
}[Type];

type JudgeTaskDataFor<Type extends TaskType> = {
  [TaskType.Batch]: JudgeTaskDataBatch;
  [TaskType.OutputOnly]: JudgeTaskDataOutput;
  [TaskType.Communication]: JudgeTaskDataCommunication;
}[Type];

async function judgeTask<Type extends TaskType>(
  type: Type,
  context: JudgeContextFor<Type>,
  compilation: CompilationResult | null,
  task: JudgeTaskFor<Type>,
  submission: JudgeSubmission
): Promise<JudgeVerdict> {
  const dbVerdict = await db.transaction().execute(async (trx) => {
    const trxVerdict = await trx
      .insertInto("verdicts")
      .values({
        submission_id: submission.id,
        is_official: true,
        compile_memory_byte: compilation?.compile_memory_byte,
        compile_time_ms: compilation?.compile_time_ms,
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
  let raw_score = 0;
  let running_time_ms = 0;
  let running_memory_byte = 0;

  var max_score = 0;
  for (const subtask of task.subtasks) {
    const child = await judgeSubtask(type, context, subtask as JudgeSubtaskFor<Type>, dbVerdict.id);
    allVerdictSubtasks.push(child);

    running_memory_byte = Math.max(running_memory_byte, child.running_memory_byte);
    running_time_ms = Math.max(running_time_ms, child.running_time_ms);
    if (child.verdict != Verdict.Accepted) {
      verdict = child.verdict;
    } else {
      raw_score += child.raw_score;
    }
    max_score += subtask.score_max;
  }
  if (0 < raw_score && raw_score < max_score) {
    verdict = Verdict.Partial;
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

async function judgeSubtask<Type extends TaskType>(
  type: Type,
  context: JudgeContextFor<Type>,
  subtask: JudgeSubtaskFor<Type>,
  verdict_id: string
): Promise<JudgeVerdictSubtask> {
  const dbSubtask = await db
    .insertInto("verdict_subtasks")
    .values({
      subtask_id: subtask.id,
      verdict_id: verdict_id,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  const allVerdictData: JudgeVerdictTaskData[] = [];
  let verdict: Verdict = Verdict.Accepted;
  let raw_score = subtask.score_max;
  let running_time_ms = 0;
  let running_memory_byte = 0;
  for (const data of subtask.data) {
    const child = await judgeTaskData(type, context, data as JudgeTaskDataFor<Type>, dbSubtask.id);
    allVerdictData.push(child);

    running_memory_byte = Math.max(running_memory_byte, child.running_memory_byte);
    running_time_ms = Math.max(running_time_ms, child.running_time_ms);
    if (child.verdict != Verdict.Accepted) {
      verdict = child.verdict;
      raw_score = 0;
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
    verdict: verdict,
    raw_score: raw_score,
    running_time_ms: running_time_ms,
    running_memory_byte: running_memory_byte,
    data: allVerdictData,
  };
}

async function judgeTaskData<Type extends TaskType>(
  type: Type,
  context: JudgeContextFor<Type>,
  task_data: JudgeTaskDataFor<Type>,
  verdict_subtask_id: string
): Promise<JudgeVerdictTaskData> {
  let result: EvaluationResult;
  switch (type) {
    case TaskType.Batch:
      result = await evaluateTaskDataForBatch(
        context as JudgeContextFor<TaskType.Batch>,
        task_data as JudgeTaskDataFor<TaskType.Batch>
      );
      break;
    case TaskType.OutputOnly:
      result = await evaluateTaskDataForOutput(
        context as JudgeContextFor<TaskType.OutputOnly>,
        task_data as JudgeTaskDataFor<TaskType.OutputOnly>
      );
      break;
    case TaskType.Communication:
      result = await evaluateTaskDataForCommunication(
        context as JudgeContextFor<TaskType.Communication>,
        task_data as JudgeTaskDataFor<TaskType.Communication>
      );
      break;
    default:
      throw new UnreachableError(type);
  }

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
    .returning(["id"])
    .executeTakeFirstOrThrow();

  return {
    id: dbTaskData.id,
    task_data_id: task_data.id,
    verdict: result.verdict,
    raw_score: result.raw_score,
    running_time_ms: result.running_time_ms,
    running_memory_byte: result.running_memory_byte,
  };
}
