import { Language, ProgrammingLanguage, Verdict } from "common/types/constants";
import { JudgeChecker } from "common/types/judge";

export type EvaluationResult = {
  verdict: Verdict;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
};

export type CompilationResult<Context> = {
  context: Context;
  compile_time_ms: number;
  compile_memory_byte: number;
};

export type GoJudgeEvaluationContext = {
  submissionRoot: string;
  judgeRoot: string;
  language: ProgrammingLanguage;
  execFileIds: Record<string, string>;
  checker: JudgeChecker;
};
