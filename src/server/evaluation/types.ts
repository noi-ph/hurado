import { Verdict } from "common/types/constants";
import { ContestantScript, JudgeChecker, JudgeScript } from "common/types/judge";

export type EvaluationResult = {
  verdict: Verdict;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
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
  submission_root: string;
  scratch_root: string;
  judge_root: string;
  contestant: ContestantScript;
  checker: JudgeChecker;
};

export type JudgeEvaluationContextOutput = {
  submission_root: string;
  judge_root: string;
  checker: JudgeChecker;
};

export type JudgeEvaluationContextCommunication = {
  submission_root: string;
  scratch_root: string;
  judge_root: string;
  contestant: ContestantScript;
  communicator: JudgeScript;
  checker: JudgeChecker;
};
