import { Language, Verdict } from "common/types/constants";

// Pass in anything you need to do the judgments
export type EvaluationContext = {
  submission_exe: string;
  submission_root: string;
  judge_root: string;
};

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

export function getLanguageFilename(language: Language) {
  switch (language) {
    case Language.CPP:
      return "main.cpp";
    case Language.Java:
      return "main.java";
    case Language.Python3:
      return "main.py";
    default:
      return "main.txt";
  }
}
