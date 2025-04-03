import { Kysely, Transaction } from "kysely";
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
import { Models } from "common/types";

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
        const compilation = await compileSubmission(task, submission, submissionRoot);
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
        const compilation = await compileSubmission(task, submission, submissionRoot);
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
  let score_raw = 0;
  let running_time_ms = 0;
  let running_memory_byte = 0;

  let score_max = 0;
  const is_compile_error = compilation !== null && compilation.verdict !== Verdict.Accepted;
  const verdict_cache = new Map<string, JudgeVerdictTaskData>();
  for (const subtask of task.subtasks) {
    const child = await judgeSubtask(
      type,
      context,
      task,
      subtask as JudgeSubtaskFor<Type>,
      dbVerdict.id,
      verdict_cache,
      is_compile_error // Compile Error, skip all
    );
    allVerdictSubtasks.push(child);

    running_memory_byte = Math.max(running_memory_byte, child.running_memory_byte);
    running_time_ms = Math.max(running_time_ms, child.running_time_ms);
    verdict = minVerdict(verdict, child.verdict);
    score_raw += child.score_raw;
    score_max += subtask.score_max;
  }
  if (0 < score_raw && score_raw < score_max) {
    verdict = Verdict.Partial;
  }
  if (is_compile_error) {
    verdict = Verdict.CompileError;
  }

  await db
    .updateTable("verdicts")
    .set({
      verdict: verdict,
      score_raw: score_raw,
      running_time_ms: running_time_ms,
      running_memory_byte: running_memory_byte,
    })
    .where("id", "=", dbVerdict.id)
    .returning(["id"])
    .execute();

  upsertOverallVerdict(task, submission.user_id, submission.contest_id, db);

  return {
    id: dbVerdict.id,
    submission_id: submission.id,
    created_at: dbVerdict.created_at,
    is_official: true,
    verdict: verdict,
    score_raw: score_raw,
    running_time_ms: running_time_ms,
    running_memory_byte: running_memory_byte,
    subtasks: allVerdictSubtasks,
  };
}

async function judgeSubtask<Type extends TaskType>(
  type: Type,
  context: JudgeContextFor<Type>,
  task: JudgeTaskFor<Type>,
  subtask: JudgeSubtaskFor<Type>,
  verdict_id: string,
  verdict_cache: Map<string, JudgeVerdictTaskData>,
  doomed_subtask = false
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
  let score_scaled = subtask.score_max;
  let running_time_ms = 0;
  let running_memory_byte = 0;
  let bad_subtask = doomed_subtask;
  for (const data of subtask.data) {
    const child = await judgeTaskData(
      type,
      context,
      task,
      data as JudgeTaskDataFor<Type>,
      dbSubtask.id,
      verdict_cache,
      bad_subtask
    );
    allVerdictData.push(child);

    running_memory_byte = Math.max(running_memory_byte, child.running_memory_byte);
    running_time_ms = Math.max(running_time_ms, child.running_time_ms);

    verdict = minVerdict(verdict, child.verdict);
    score_scaled = Math.min(score_scaled, child.score_raw);
    if (badVerdict(child.verdict)) {
      bad_subtask = true;
    }
  }

  const score_raw = score_scaled * subtask.score_max;

  await db
    .updateTable("verdict_subtasks")
    .set({
      verdict: verdict,
      score_raw: score_raw,
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
    score_raw: score_raw,
    running_time_ms: running_time_ms,
    running_memory_byte: running_memory_byte,
    data: allVerdictData,
  };
}

function getTaskHash<Type extends TaskType>(task_data: JudgeTaskDataFor<Type>) {
  if ('input_file_hash' in task_data) {
    return task_data.input_file_hash;
  }
  return undefined;
}

async function judgeTaskData<Type extends TaskType>(
  type: Type,
  context: JudgeContextFor<Type>,
  task: JudgeTaskFor<Type>,
  task_data: JudgeTaskDataFor<Type>,
  verdict_subtask_id: string,
  verdict_cache: Map<string, JudgeVerdictTaskData>,
  bad_subtask: boolean
): Promise<JudgeVerdictTaskData> {
  const task_hash = getTaskHash(task_data);
  const cached_verdict = task_hash != undefined ? verdict_cache.get(task_hash) : undefined;
  let result: EvaluationResult;
  if (bad_subtask) {
    result = {
      verdict: Verdict.Skipped,
      score_raw: 0,
      running_time_ms: 0,
      running_memory_byte: 0,
    };
  } else if (cached_verdict != undefined) {
    result = cached_verdict;
  } else {
    switch (type) {
      case TaskType.Batch:
        result = await evaluateTaskDataForBatch(
          context as JudgeContextFor<TaskType.Batch>,
          task as JudgeTaskFor<TaskType.Batch>,
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
          task as JudgeTaskFor<TaskType.Communication>,
          task_data as JudgeTaskDataFor<TaskType.Communication>
        );
        break;
      default:
        throw new UnreachableError(type);
    }
  }

  const dbTaskData = await db
    .insertInto("verdict_task_data")
    .values({
      verdict_subtask_id: verdict_subtask_id,
      task_data_id: task_data.id,
      verdict: result.verdict,
      score_raw: result.score_raw,
      running_time_ms: result.running_time_ms,
      running_memory_byte: result.running_memory_byte,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  const returnResult: JudgeVerdictTaskData = {
    id: dbTaskData.id,
    task_data_id: task_data.id,
    verdict: result.verdict,
    score_raw: result.score_raw,
    running_time_ms: result.running_time_ms,
    running_memory_byte: result.running_memory_byte,
  };
  if (task_hash != undefined && returnResult.verdict !== Verdict.Skipped) {
    verdict_cache.set(task_hash, returnResult);
  }
  return returnResult;
}

export async function upsertOverallVerdict(
  task: JudgeTask,
  user_id: string,
  contest_id: string | null,
  trx: Kysely<Models> | Transaction<Models>
) {
  let score_max = 0;
  for (const subtask of task.subtasks) {
    score_max += subtask.score_max;
  }

  // compute the overall verdict from all past submissions
  const allSubmissions = await trx
    .selectFrom("task_subtasks")
    .where("task_subtasks.task_id", "=", task.id)
    .innerJoin("verdict_subtasks", "verdict_subtasks.subtask_id", "task_subtasks.id")
    .innerJoin("verdicts", "verdicts.id", "verdict_subtasks.verdict_id")
    .where("verdicts.is_official", "=", true)
    .select(["task_subtasks.order", "verdict_subtasks.score_raw"])
    .execute();

  const allScoreOverall = computeScoreOverall(allSubmissions);
  await trx
    .insertInto("overall_verdicts")
    .values({
      task_id: task.id,
      user_id: user_id,
      contest_id: null,
      score_overall: allScoreOverall,
      score_max,
    })
    .onConflict((conflict) => {
      return conflict.constraint("idx_overall_verdicts_contest_id_user_id_task_id").doUpdateSet({
        score_overall: (eb) => eb.ref("excluded.score_overall"),
        score_max: (eb) => eb.ref("excluded.score_max"),
      });
    })
    .execute();

  if (contest_id != null) {
    const contestSubmissions = await trx
      .selectFrom("task_subtasks")
      .where("task_subtasks.task_id", "=", task.id)
      .innerJoin("verdict_subtasks", "verdict_subtasks.subtask_id", "task_subtasks.id")
      .innerJoin("verdicts", "verdicts.id", "verdict_subtasks.verdict_id")
      .innerJoin("submissions", "submissions.id", "verdicts.submission_id")
      .where("submissions.contest_id", "=", contest_id)
      .where("verdicts.is_official", "=", true)
      .select(["task_subtasks.order", "verdict_subtasks.score_raw"])
      .execute();

    const contestScoreOverall = computeScoreOverall(contestSubmissions);
    await trx
      .insertInto("overall_verdicts")
      .values({
        task_id: task.id,
        user_id: user_id,
        contest_id: contest_id,
        score_overall: contestScoreOverall,
        score_max,
      })
      .onConflict((conflict) => {
        return conflict.constraint("idx_overall_verdicts_contest_id_user_id_task_id").doUpdateSet({
          score_overall: (eb) => eb.ref("excluded.score_overall"),
          score_max: (eb) => eb.ref("excluded.score_max"),
        });
      })
      .execute();
  }
}

type SubtaskVerdict = {
  order: number;
  score_raw: number | null;
};

function computeScoreOverall(submissions: SubtaskVerdict[]) {
  const maxOfEachSubtask = new Map<number, number>();
  for (const { order, score_raw } of submissions) {
    maxOfEachSubtask.set(order, Math.max(maxOfEachSubtask.get(order) ?? 0, score_raw ?? 0));
  }

  let overall = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
  for (const [_order, score] of maxOfEachSubtask.entries()) {
    overall += score;
  }

  return overall;
}

function minVerdict(current: Verdict, next: Verdict): Verdict {
  if (VERDICT_PRIORITY[next] < VERDICT_PRIORITY[current]) {
    return next;
  }
  return current;
}

function badVerdict(verdict: Verdict) {
  switch (verdict) {
    case Verdict.Accepted:
    case Verdict.Skipped:
    case Verdict.Partial:
    case Verdict.JudgeFailed:
      return false;
    case Verdict.WrongAnswer:
    case Verdict.RuntimeError:
    case Verdict.TimeLimitExceeded:
    case Verdict.MemoryLimitExceeded:
    case Verdict.CompileError:
      return true;
    default:
      throw new UnreachableError(verdict);
  }
}

const VERDICT_PRIORITY: Record<Verdict, number> = {
  [Verdict.Accepted]: 6,
  [Verdict.Skipped]: 5,
  [Verdict.Partial]: 4,
  [Verdict.WrongAnswer]: 3,
  [Verdict.RuntimeError]: 3,
  [Verdict.TimeLimitExceeded]: 3,
  [Verdict.MemoryLimitExceeded]: 3,
  [Verdict.CompileError]: 2,
  [Verdict.JudgeFailed]: 1,
};
