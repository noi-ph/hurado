import { JudgeTaskDataOutput } from "common/types/judge";
import { EvaluationResult, JudgeEvaluationContextOutput } from "./types";
import { checkSubmissionOutput } from "./judge_checker";

export async function evaluateTaskDataForOutput(
  context: JudgeEvaluationContextOutput,
  data: JudgeTaskDataOutput
): Promise<EvaluationResult> {
  const checkerResult = await checkSubmissionOutput({
    checker: context.checker,
    task_root: context.task_root,
    judge_file_name: data.judge_file_name,
    output_root: context.submission_root,
    output_file_name: data.judge_file_name,
  });

  return {
    verdict: checkerResult.verdict,
    score_raw: checkerResult.score_raw,
    running_time_ms: 0,
    running_memory_byte: 0,
  };
}
