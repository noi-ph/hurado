import fs from "fs";
import path from "path";
import ChildProcess from "child_process";
import { JudgeChecker, JudgeScript, JudgeTaskDataCommunication } from "common/types/judge";
import { EvaluationResult, IsolateResult, JudgeEvaluationContextCommunication } from "./types";
import { checkSubmissionOutput } from "./judge_checker";
import { LANGUAGE_SPECS } from "./judge_compile";
import {
  ISOLATE_EXECUTABLE,
  IsolateInstance,
  IsolateUtils,
  makeContestantArgv,
} from "./judge_utils";
import { Verdict } from "common/types/constants";
import { UnreachableError } from "common/errors";

export async function evaluateTaskDataForCommunication(
  context: JudgeEvaluationContextCommunication,
  data: JudgeTaskDataCommunication
): Promise<EvaluationResult> {
  const isoContestant = await IsolateUtils.init();
  const isoCommunicator = await IsolateUtils.init();

  try {
    const argvContestant = makeContestantArgv(
      context.contestant,
      isoContestant,
      context.submission_root
    );
    const argvCommunicator = makeCommunicatorArgv({
      communicator: context.communicator,
      isolate: isoCommunicator,
      judge_root: context.judge_root,
      scratch_root: context.scratch_root,
      input_file_name: data.input_file_name,
      judge_file_name: data.judge_file_name,
    });

    const procContestant = ChildProcess.spawn(ISOLATE_EXECUTABLE, argvContestant);
    const procCommunicator = ChildProcess.spawn(ISOLATE_EXECUTABLE, argvCommunicator);
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

    const judgePath = path.join(context.judge_root, data.judge_file_name);
    const answerPath = path.join(context.scratch_root, data.judge_file_name);

    // Need to await these so that we can clean up at the end properly
    return await makeCommunicationVerdict(
      rContestant,
      rCommunicator,
      context.checker,
      judgePath,
      answerPath
    );
  } finally {
    Promise.all([IsolateUtils.cleanup(isoCommunicator), IsolateUtils.cleanup(isoContestant)]);
  }
}

function makeCommunicatorArgv(opts: {
  communicator: JudgeScript;
  isolate: IsolateInstance;
  judge_root: string;
  scratch_root: string;
  input_file_name: string;
  judge_file_name: string;
}): string[] {
  const { communicator, isolate, judge_root, scratch_root, input_file_name, judge_file_name } = opts;
  const spec = LANGUAGE_SPECS[communicator.language];
  const argv: string[] = [
    `--box-id=${isolate.name}`,
    `--dir=/task=${judge_root}`,
    `--dir=/scratch=${scratch_root}:rw`,
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

  const inputPath = path.join('/task', input_file_name);
  const judgePath = path.join('/task', judge_file_name);
  const answerPath = path.join('/scratch', judge_file_name);

  argv.push(inputPath);
  argv.push(judgePath);
  argv.push(answerPath);

  return argv;
}

async function makeCommunicationVerdict(
  rContestant: IsolateResult,
  rCommunicator: IsolateResult,
  checker: JudgeChecker,
  judgePath: string,
  answerPath: string
): Promise<EvaluationResult> {
  if (rCommunicator.verdict !== Verdict.Accepted) {
    return {
      verdict: Verdict.JudgeFailed,
      running_memory_byte: rContestant.running_memory_byte,
      running_time_ms: rContestant.running_time_ms,
      raw_score: 0,
    };
  }

  switch (rContestant.verdict) {
    case Verdict.MemoryLimitExceeded:
    case Verdict.TimeLimitExceeded:
    case Verdict.RuntimeError:
    case Verdict.JudgeFailed:
      return {
        verdict: Verdict.JudgeFailed,
        running_memory_byte: rContestant.running_memory_byte,
        running_time_ms: rContestant.running_time_ms,
        raw_score: 0,
      };
    case Verdict.Accepted:
      return checkSubmissionOutput(checker, judgePath, answerPath);
    default:
      throw new UnreachableError(rContestant.verdict);
  }
}
