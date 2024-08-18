import ChildProcess from "child_process";
import fs from "fs";
import path from "path";
import { Language, Verdict } from "common/types/constants";
import { JudgeSubmission, JudgeTask, JudgeTaskData } from "common/types/judge";
import { sleep } from "common/utils/sleep";

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

export type CompilationResult = {
  context: EvaluationContext;
  compile_time_ms: number;
  compile_memory_byte: number;
};

export async function compileSubmission(
  task: JudgeTask,
  submission: JudgeSubmission,
  taskDir: string,
  submissionDir: string
): Promise<CompilationResult> {
  const mainFilename = getLanguageFilename(submission.language as Language);

  const context: EvaluationContext = {
    submission_exe: path.join(submissionDir, mainFilename),
    submission_root: submissionDir,
    judge_root: taskDir,
  };

  return {
    context,
    compile_time_ms: 0,
    compile_memory_byte: 0,
  };
}

export async function evaluateTaskData(
  context: EvaluationContext,
  data: JudgeTaskData
): Promise<EvaluationResult> {
  const inputPath = path.join(context.judge_root, data.input_file_name);
  const answerPath = path.join(context.judge_root, data.output_file_name);
  const outputPath = path.join(context.submission_root, "output.txt");

  const runStatus = await spawn("python3", [context.submission_exe], inputPath, outputPath);
  if (runStatus != 0) {
    return {
      verdict: Verdict.RuntimeError,
      raw_score: 0,
      running_time_ms: 0,
      running_memory_byte: 0,
    };
  }

  const diffStatus = await spawnNoStdio("diff", [answerPath, outputPath]);
  if (diffStatus == 0) {
    return {
      verdict: Verdict.Accepted,
      raw_score: 1,
      running_time_ms: 0,
      running_memory_byte: 0,
    };
  } else {
    return {
      verdict: Verdict.WrongAnswer,
      raw_score: 0,
      running_time_ms: 0,
      running_memory_byte: 0,
    };
  }
}

function spawn(
  binary: string,
  args: string[],
  inputPath: string,
  outputPath: string
): Promise<number> {
  const inputStream = fs.createReadStream(inputPath);
  const outputStream = fs.createWriteStream(outputPath);
  return new Promise((resolve) => {
    const child = ChildProcess.spawn(binary, args);
    if (child.stdin) {
      inputStream.pipe(child.stdin);
    }
    if (child.stdout) {
      child.stdout.pipe(outputStream);
    }

    child.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

function spawnNoStdio(binary: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = ChildProcess.spawn(binary, args);

    child.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

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
