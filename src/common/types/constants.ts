export enum TaskType {
  Batch = "batch",
  OutputOnly = "output",
  Communication = "communication",
}

export enum TaskFlavor {
  OutputText = "text",
  OutputFile = "file",
}

export type TaskFlavorOutput = TaskFlavor.OutputText | TaskFlavor.OutputFile;

export enum Language {
  Python3 = "python3",
  CPP = "cpp",
  Java = "java",
  PlainText = "text",
}

export type ProgrammingLanguage = Exclude<Language, Language.PlainText>;

export type JudgeLanguage = Language.Python3 | Language.CPP;

export enum Verdict {
  Accepted = "ac",
  Partial = "pa",
  WrongAnswer = "wa",
  RuntimeError = "re",
  TimeLimitExceeded = "tle",
  MemoryLimitExceeded = "mle",
  CompileError = "ce",
  JudgeFailed = "jf",
  Skipped = "skip",
}

export enum CheckerKind {
  LenientDiff = "ld",
  Custom = "xx",
}

export enum ReducerKind {
  MinData = "min",
  Custom = "xx",
}

export function humanizeLanguage(language: Language): string {
  switch (language) {
    case Language.Python3:
      return "Python 3.9.2";
    case Language.CPP:
      return "C++";
    case Language.Java:
      return "Java";
    default:
      return language;
  }
}

export function humanizeVerdict(verdict: Verdict, score: number | null): string {
  switch (verdict) {
    case Verdict.Accepted:
      return "Accepted";
    case Verdict.Partial: {
      if (score == null) {
        return 'Partial';
      } else {
        return `Partial: ${score} point${score == 1 ? '' : 's'}`; // TODO: i18n
      }
    }
    case Verdict.WrongAnswer:
      return "Wrong Answer";
    case Verdict.RuntimeError:
      return "Runtime Error";
    case Verdict.TimeLimitExceeded:
      return "Time Limit Exceeded";
    case Verdict.MemoryLimitExceeded:
      return "Memory Limit Exceeded";
    case Verdict.CompileError:
      return "Compile Error";
    case Verdict.JudgeFailed:
      return "Judge Failed";
    case Verdict.Skipped:
      return "Skipped";
    default:
      return verdict;
  }
}
