import fs from "fs";
import path from "path";
import { WriteStream } from "tty";
import ChildProcess from "child_process";
import { ContestantScript, JudgeTaskDataBatch } from "common/types/judge";
import { EvaluationResult, IsolateResult, JudgeEvaluationContextBatch } from "./types";
import { checkSubmissionOutput } from "./judge_checker";
import { Verdict } from "common/types/constants";
import { UnreachableError } from "common/errors";
import { ISOLATE_BIN, IsolateUtils, makeContestantArgv } from "./judge_utils";

export async function evaluateTaskDataForBatch(
  context: JudgeEvaluationContextBatch,
  data: JudgeTaskDataBatch
): Promise<EvaluationResult> {
  const inputPath = path.join(context.task_root, data.input_file_name);
  const outputPath = path.join(context.output_root, data.judge_file_name);
  const isolateResult = await runContestantScript(
    context.contestant,
    context.submission_root,
    inputPath,
    outputPath,
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
    case Verdict.Accepted: {
      const checkerResult = await checkSubmissionOutput({
        checker: context.checker,
        task_root: context.task_root,
        judge_file_name: data.judge_file_name,
        output_root: context.output_root,
        output_file_name: data.judge_file_name,
      });
      return {
        verdict: checkerResult.verdict,
        raw_score: checkerResult.raw_score,
        running_time_ms: isolateResult.running_time_ms,
        running_memory_byte: isolateResult.running_memory_byte,
      };
    }
    default:
      throw new UnreachableError(isolateResult.verdict);
  }
}

async function runContestantScript(
  script: ContestantScript,
  submissionRoot: string,
  inputPath: string,
  outputPath: string,
  stderr: WriteStream | null
): Promise<IsolateResult> {
  // TODO: Enable memory / time limits
  return IsolateUtils.with(async (isolate) => {
    const argv = makeContestantArgv(script, isolate, submissionRoot);

    const inputFile = await fs.promises.open(inputPath, "r");
    const outputFile = await fs.promises.open(outputPath, "w");

    try {
      const child = ChildProcess.spawn(ISOLATE_BIN, argv, {
        stdio: [inputFile.fd, outputFile.fd, stderr],
      });

      const promise = new Promise<IsolateResult>((resolve) => {
        child.on("exit", async () => {
          try {
            // Need this await so the catch block can catch exceptions
            const result = await IsolateUtils.readResult(isolate);
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
      await Promise.all([inputFile.close(), outputFile.close()]);
    }
  });
}
