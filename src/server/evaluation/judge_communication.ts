import fs from "fs";
import path from "path";
import ChildProcess from "child_process";
import { ContestantScript, JudgeScript, JudgeTaskDataCommunication } from "common/types/judge";
import { EvaluationResult, JudgeEvaluationContextCommunication } from "./types";
import { checkSubmissionOutput } from "./judge_checker";
import { LANGUAGE_SPECS } from "./judge_compile";

export async function evaluateTaskDataForCommunication(
  context: JudgeEvaluationContextCommunication,
  data: JudgeTaskDataCommunication
): Promise<EvaluationResult> {
  const inputPath = path.join(context.judge_root, data.input_file_name);
  const judgePath = path.join(context.judge_root, data.judge_file_name);
  const answerPath = path.join(context.judge_root, data.judge_file_name + "ans");
  const communicator = runCommunicatorScript(
    context.communicator,
    inputPath,
    judgePath,
    answerPath
  );
  const contestant = runContestantScript(context.contestant, metaPath);
  communicator.stdout.pipe(contestant.stdin);
  contestant.stdout.pipe(communicator.stdin);

  return new Promise(async (resolve, _reject) => {
    communicator.on("exit", () => {
      contestant.kill();
    });

    const metaContent = fs.readFileSync(metaPath).toString("utf8");
    const outputContent = fs.readFileSync(answerPath).toString("utf8");
    const result = await checkSubmissionOutput(judgePath, answerPath, context.checker);
    resolve(result);
  });
}

function runCommunicatorScript(
  communicator: JudgeScript,
  inputPath: string,
  judgePath: string,
  answerPath: string
) {
  const spec = LANGUAGE_SPECS[communicator.language];

  const argv: string[] = ["--run", "--"];

  if (spec.interpreter != null) {
    argv.push(spec.interpreter);
  }
  if (communicator.exe_name != null) {
    argv.push(communicator.exe_name);
  } else {
    throw new Error("Missing communicator exe name");
  }

  argv.push(inputPath);
  argv.push(judgePath);
  argv.push(answerPath);

  return ChildProcess.spawn("isolate", argv);
}

function runContestantScript(script: ContestantScript, metaPath: string) {
  const spec = LANGUAGE_SPECS[script.language];
  const argv: string[] = ["--run", "--meta", metaPath, "--"];

  if (spec.interpreter != null) {
    argv.push(spec.interpreter);
  }
  if (script.exe_name != null) {
    argv.push(script.exe_name);
  } else {
    throw new Error("Missing script exe name");
  }

  return ChildProcess.spawn("isolate", argv);
}
