export enum Language {
  Python3 = "python3",
  CPP = "cpp",
  Java = "java",
}

export enum Verdict {
  Accepted = "ac",
  WrongAnswer = "wa",
  RuntimeError = "re",
  TimeLimitExceeded = "tle",
  MemoryLimitExceeded = "mle",
  Skipped = "skip",
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

export function humanizeVerdict(verdict: Verdict): string {
  switch (verdict) {
    case Verdict.Accepted:
      return "Accepted";
    case Verdict.WrongAnswer:
      return "Wrong Answer";
    case Verdict.RuntimeError:
      return "Runtime Error";
    case Verdict.TimeLimitExceeded:
      return "Time Limit Exceeded";
    case Verdict.MemoryLimitExceeded:
      return "Memory Limit Exceeded";
    case Verdict.Skipped:
      return "Skipped";
    default:
      return verdict;
  }
}
