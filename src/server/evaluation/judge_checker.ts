import fs from "fs";
import { JudgeChecker, JudgeScript } from "common/types/judge";
import { EvaluationResult } from "./types";
import { CheckerKind, Language, Verdict } from "common/types/constants";
import { UnreachableError } from "common/errors";
import { runChildProcess } from "./judge_utils";

export async function checkSubmissionOutput(
  judgePath: string,
  answerPath: string,
  checker: JudgeChecker
): Promise<EvaluationResult> {
  try {
    await fs.promises.lstat(answerPath);
  } catch (e) {
    // File does not exist. Skip it!
    return {
      verdict: Verdict.Skipped,
      raw_score: 0,
      running_time_ms: 0,
      running_memory_byte: 0,
    };
  }
  switch (checker.kind) {
    case CheckerKind.LenientDiff: {
      const diffStatus = await runChildProcess(["diff", judgePath, answerPath]);
      if (diffStatus == 0) {
        return {
          verdict: Verdict.Accepted,
          raw_score: 1,
          running_time_ms: 0,
          running_memory_byte: 0,
        };
      }
      break;
    }
    case CheckerKind.Custom: {
      return runCustomChecker(judgePath, answerPath, checker.script);
      break;
    }
    default:
      throw new UnreachableError(checker);
  }

  return {
    verdict: Verdict.WrongAnswer,
    raw_score: 0,
    running_time_ms: 0,
    running_memory_byte: 0,
  };
}

async function runCustomChecker(
  judgePath: string,
  answerPath: string,
  checker: JudgeScript
): Promise<EvaluationResult> {
  switch (checker.language) {
    case Language.Python3: {
      const status = await runChildProcess([
        "python3",
        checker.exe_name!,
        ...checker.argv,
        judgePath,
        answerPath,
      ]);
      if (status == 0) {
        return {
          verdict: Verdict.Accepted,
          raw_score: 1,
          running_time_ms: 0,
          running_memory_byte: 0,
        };
      }
      break;
    }
    case Language.CPP: {
      const status = await runChildProcess([
        checker.exe_name!,
        ...checker.argv,
        judgePath,
        answerPath,
      ]);
      if (status == 0) {
        return {
          verdict: Verdict.Accepted,
          raw_score: 1,
          running_time_ms: 0,
          running_memory_byte: 0,
        };
      }
      break;
    }
    default:
      throw new UnreachableError(checker.language);
  }

  return {
    verdict: Verdict.WrongAnswer,
    raw_score: 0,
    running_time_ms: 0,
    running_memory_byte: 0,
  };
}
