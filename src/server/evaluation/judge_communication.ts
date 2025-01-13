import path from "path";
import ChildProcess from "child_process";
import { JudgeChecker, JudgeScript, JudgeTaskDataCommunication } from "common/types/judge";
import { EvaluationResult, IsolateResult, JudgeEvaluationContextCommunication } from "./types";
import { checkSubmissionOutput } from "./judge_checker";
import { LANGUAGE_SPECS } from "./judge_compile";
import { ISOLATE_BIN, IsolateInstance, IsolateUtils, makeContestantArgv } from "./judge_utils";
import { Verdict } from "common/types/constants";
import { UnreachableError } from "common/errors";

export async function evaluateTaskDataForCommunication(
  context: JudgeEvaluationContextCommunication,
  data: JudgeTaskDataCommunication
): Promise<EvaluationResult> {
  return IsolateUtils.with2(async (isoContestant, isoCommunicator) => {
    const argvContestant = makeContestantArgv(
      context.contestant,
      isoContestant,
      context.submission_root
    );
    const argvCommunicator = makeCommunicatorArgv({
      communicator: context.communicator,
      isolate: isoCommunicator,
      task_root: context.task_root,
      output_root: context.output_root,
      input_file_name: data.input_file_name,
      judge_file_name: data.judge_file_name,
    });

    const procContestant = ChildProcess.spawn(ISOLATE_BIN, argvContestant);
    const procCommunicator = ChildProcess.spawn(ISOLATE_BIN, argvCommunicator);
    procContestant.stdout.pipe(procCommunicator.stdin);
    procCommunicator.stdout.pipe(procContestant.stdin);
    procCommunicator.stderr.pipe(process.stderr);

    const promiseContestant = new Promise<void>((resolve) => {
      procContestant.on("exit", () => {
        procCommunicator.kill();
        resolve();
      });
    });
    const promiseCommunicator = new Promise<void>((resolve) => {
      procCommunicator.on("exit", () => {
        procCommunicator.kill();
        resolve();
      });
    });

    await Promise.all([promiseContestant, promiseCommunicator]);

    const [rContestant, rCommunicator] = await Promise.all([
      IsolateUtils.readResult(isoContestant),
      IsolateUtils.readResult(isoCommunicator),
    ]);

    // Need to await these so that we can clean up at the end properly
    return makeCommunicationVerdict({
      contestantResult: rContestant,
      communicatorResult: rCommunicator,
      checker: context.checker,
      task_root: context.task_root,
      judge_file_name: data.judge_file_name,
      output_root: context.output_root,
      output_file_name: data.judge_file_name,
    });
  });
}

function makeCommunicatorArgv(opts: {
  communicator: JudgeScript;
  isolate: IsolateInstance;
  task_root: string;
  output_root: string;
  input_file_name: string;
  judge_file_name: string;
}): string[] {
  const { communicator, isolate, task_root, output_root, input_file_name, judge_file_name } = opts;
  const spec = LANGUAGE_SPECS[communicator.language];
  const argv: string[] = [
    `--box-id=${isolate.name}`,
    `--dir=/task=${task_root}`,
    `--dir=/output=${output_root}:rw`,
    "--chdir=/task",
    `--meta=${isolate.meta}`,
    "--run",
    "--",
  ];

  if (spec.interpreter == null) {
    argv.push(`/submission/${communicator.exe_name}`);
  } else if (communicator.exe_name != null) {
    argv.push(spec.interpreter);
    argv.push(communicator.exe_name);
  } else {
    throw new Error("Missing communicator exe_name");
  }

  const inputPath = path.join("/task", input_file_name);
  const judgePath = path.join("/task", judge_file_name);
  const outputPath = path.join("/output", judge_file_name);

  argv.push(inputPath);
  argv.push(judgePath);
  argv.push(outputPath);

  return argv;
}

async function makeCommunicationVerdict(opts: {
  contestantResult: IsolateResult;
  communicatorResult: IsolateResult;
  checker: JudgeChecker;
  task_root: string;
  judge_file_name: string;
  output_root: string;
  output_file_name: string;
}): Promise<EvaluationResult> {
  const {
    contestantResult,
    communicatorResult,
    checker,
    task_root,
    judge_file_name,
    output_root,
    output_file_name,
  } = opts;

  if (communicatorResult.verdict !== Verdict.Accepted) {
    return {
      verdict: Verdict.JudgeFailed,
      running_memory_byte: contestantResult.running_memory_byte,
      running_time_ms: contestantResult.running_time_ms,
      score_raw: 0,
    };
  }

  switch (contestantResult.verdict) {
    case Verdict.MemoryLimitExceeded:
    case Verdict.TimeLimitExceeded:
    case Verdict.RuntimeError:
      return {
        verdict: contestantResult.verdict,
        score_raw: 0,
        running_time_ms: contestantResult.running_time_ms,
        running_memory_byte: contestantResult.running_memory_byte,
      };
    case Verdict.JudgeFailed:
      return {
        verdict: Verdict.JudgeFailed,
        score_raw: 0,
        running_time_ms: contestantResult.running_time_ms,
        running_memory_byte: contestantResult.running_memory_byte,
      };
    case Verdict.Accepted: {
      const checkerResult = await checkSubmissionOutput({
        checker,
        task_root,
        judge_file_name,
        output_root,
        output_file_name,
      });
      return {
        verdict: checkerResult.verdict,
        score_raw: checkerResult.score_raw,
        running_time_ms: contestantResult.running_time_ms,
        running_memory_byte: contestantResult.running_memory_byte,
      };
    }
    default:
      throw new UnreachableError(contestantResult.verdict);
  }
}
