import path from "path";
import { JudgeTaskDataOutput } from "common/types/judge";
import { EvaluationResult, JudgeEvaluationContextOutput } from "./types";
import { checkSubmissionOutput } from "./judge_checker";

export async function evaluateTaskDataForOutput(
  context: JudgeEvaluationContextOutput,
  data: JudgeTaskDataOutput
): Promise<EvaluationResult> {
  const judgePath = path.join(context.judge_root, data.judge_file_name);
  const submissionPath = path.join(context.submission_root, data.judge_file_name);
  return checkSubmissionOutput(context.checker, judgePath, submissionPath)
}
