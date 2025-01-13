import { Verdict } from "common/types/constants";
import { ContestantScript, JudgeChecker, JudgeScript } from "common/types/judge";

export type EvaluationResult = {
  verdict: Verdict;
  score_raw: number;
  running_time_ms: number;
  running_memory_byte: number;
};

export type CheckerResult = {
  verdict: Verdict.Accepted | Verdict.Partial | Verdict.WrongAnswer;
  score_raw: number;
};

type IsolateVerdict =
  | Verdict.Accepted
  | Verdict.RuntimeError
  | Verdict.MemoryLimitExceeded
  | Verdict.TimeLimitExceeded
  | Verdict.JudgeFailed;

export type IsolateResult = {
  verdict: IsolateVerdict;
  running_time_ms: number;
  running_memory_byte: number;
};

export type CompilationResult = {
  verdict: IsolateVerdict;
  compile_time_ms: number;
  compile_memory_byte: number;
  exe_name: string;
};

export type JudgeEvaluationContextBatch = {
  task_root: string;
  output_root: string;
  submission_root: string;
  contestant: ContestantScript;
  checker: JudgeChecker;
};

export type JudgeEvaluationContextOutput = {
  task_root: string;
  submission_root: string;
  checker: JudgeChecker;
};

export type JudgeEvaluationContextCommunication = {
  task_root: string;
  output_root: string;
  submission_root: string;
  contestant: ContestantScript;
  communicator: JudgeScript;
  checker: JudgeChecker;
};
