import fs from "fs";
import path from "path";
import { WriteStream } from "tty";
import ChildProcess from "child_process";
import { ContestantScript, JudgeTaskDataBatch } from "common/types/judge";
import { EvaluationResult, IsolateResult, JudgeEvaluationContextBatch } from "./types";
import { LANGUAGE_SPECS } from "./judge_compile";
import { checkSubmissionOutput } from "./judge_checker";
import { Verdict } from "common/types/constants";
import { UnreachableError } from "common/errors";
import { ISOLATE_EXECUTABLE, IsolateUtils } from "./judge_utils";

export async function evaluateTaskDataForBatch(
  context: JudgeEvaluationContextBatch,
  data: JudgeTaskDataBatch
): Promise<EvaluationResult> {
  const inputPath = path.join(context.judge_root, data.input_file_name);
  const judgePath = path.join(context.judge_root, data.judge_file_name);
  const answerPath = path.join(context.scratch_root, data.judge_file_name);
  const isolateResult = await runContestantScript(
    context.contestant,
    context.submission_root,
    inputPath,
    answerPath,
    process.stderr
  );
  switch (isolateResult.verdict) {
    case Verdict.RuntimeError:
    case Verdict.TimeLimitExceeded:
    case Verdict.MemoryLimitExceeded:
    case Verdict.JudgeFailed:
      return {
        verdict: isolateResult.verdict,
        raw_score: 0,
        running_time_ms: isolateResult.running_time_ms,
        running_memory_byte: isolateResult.running_memory_byte,
      };
    case Verdict.Accepted:
      return checkSubmissionOutput(judgePath, answerPath, context.checker);
    default:
      throw new UnreachableError(isolateResult.verdict);
  }
}

async function runContestantScript(
  script: ContestantScript,
  submissionRoot: string,
  inputPath: string,
  answerPath: string,
  stderr: WriteStream | null
): Promise<IsolateResult> {
  // TODO: Enable memory / time limits
  const isolate = await IsolateUtils.init();
  const spec = LANGUAGE_SPECS[script.language];
  const argv: string[] = [
    "--box-id",
    isolate.name,
    "--dir",
    `/submission=${submissionRoot}`,
    "--chdir",
    "/submission",
    "--meta",
    isolate.meta,
    "--run",
    "--",
  ];

  if (spec.interpreter == null) {
    argv.push(`/submission/${script.exe_name}`);
  } else if (script.exe_name != null) {
    argv.push(spec.interpreter);
    argv.push(script.exe_name);
  } else {
    throw new Error("Missing script exe name");
  }

  const inputFile = await fs.promises.open(inputPath, "r");
  const outputFile = await fs.promises.open(answerPath, "w");

  try {
    const child = ChildProcess.spawn(ISOLATE_EXECUTABLE, argv, {
      stdio: [inputFile.fd, outputFile.fd, stderr],
    });
    const promise: Promise<IsolateResult> = new Promise((resolve) => {
      child.on("exit", async () => {
        try {
          const result = IsolateUtils.readResult(isolate);
          resolve(result);
        } catch (e) {
          console.error("Failed to parse isolate result", e);
          resolve({
            verdict: Verdict.JudgeFailed,
            running_memory_byte: 0,
            running_time_ms: 0,
          });
        }
      });
    });
    return await promise;
  } finally {
    await Promise.all([inputFile.close(), outputFile.close(), IsolateUtils.cleanup(isolate)]);
  }
}
