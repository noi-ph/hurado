export enum Language {
  Python3 = "python3",
  CPP = "cpp",
  Java = "java",
}

export enum Verdict {
  Accepted = 'ac',
  WrongAnswer = 'wa',
  RuntimeError = 're',
  TimeLimitExceeded = 'tle',
  MemoryLimitExceeded = 'mle',
  Skipped = 'skip',
}

export function humanizeLanguage(language: Language): string {
  switch(language) {
    case Language.Python3:
      return "Python 3.9.2"
    case Language.CPP:
      return "C++"
    case Language.Java:
      return "Java"
    default:
      return language;
  }
}
