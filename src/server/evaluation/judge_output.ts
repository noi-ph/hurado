import path from "path";
import {
  JudgeChecker,
  JudgeTaskDataOutput,
} from "common/types/judge";
import { EvaluationResult } from "./types";
import { checkSubmissionOutput } from "./judge_checker";

export type OutputJudgeEvaluationContext = {
  checker: JudgeChecker;
  taskDir: string;
  submissionDir: string;
};

export async function evaluateTaskDataForOutput(
  context: OutputJudgeEvaluationContext,
  data: JudgeTaskDataOutput
): Promise<EvaluationResult> {
  const judgePath = path.join(context.taskDir, data.judge_file_name);
  const submissionPath = path.join(context.submissionDir, data.judge_file_name);
  return checkSubmissionOutput(judgePath, submissionPath, context.checker)
}
