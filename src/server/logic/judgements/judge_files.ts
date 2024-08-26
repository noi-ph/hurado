import fs from "fs";
import os from "os";
import path from "path";
import { CheckerKind, JudgeLanguage, Language, TaskType } from "common/types/constants";
import { JudgeScript, JudgeSubmission, JudgeTask } from "common/types/judge";
import { SubmissionFileStorage, TaskFileStorage } from "server/files";
import { UnreachableError } from "common/errors";
import { getLanguageFilename } from "server/evaluation";
import ChildProcess from "child_process";

// TODO: Setup some sort of caching for task data so hundreds of megabytes
// aren't downloaded every time someone submits code
export class JudgeFiles {
  static async setupDirectory(): Promise<string> {
    const base = generateRandomString(32);
    const folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), base));
    return folder;
  }

  static async cleanDirectory(path: string): Promise<void> {
    await fs.promises.rm(path, { recursive: true });
  }

  static async setupTask(task: JudgeTask, dir: string): Promise<unknown> {
    await downloadTaskFiles(task, dir);
    return await compileTaskScripts(task, dir);
  }

  static async setupSubmission(submission: JudgeSubmission, dir: string): Promise<unknown> {
    return Promise.all(
      submission.files.map((file) => {
        const filename =
          file.file_name == null ? getLanguageFilename(submission.language) : file.file_name;
        return downloadSubmissionFile(dir, filename, file.hash);
      })
    );
  }
}

function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

async function compileTaskScripts(task: JudgeTask, dir: string): Promise<unknown> {
  if (task.checker.kind === CheckerKind.Custom) {
    await compileTaskScript(dir, task.checker.script);
  }

  return;
}

async function downloadTaskFiles(task: JudgeTask, dir: string): Promise<unknown> {
  switch (task.type) {
    case TaskType.Batch: {
      const promises: Promise<void>[] = [];
      promises.push(downloadTaskChecker(dir, task));
      task.subtasks.forEach((subtask) => {
        subtask.data.forEach((data) => {
          promises.push(downloadTaskFile(dir, data.input_file_name, data.input_file_hash));
          promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
        });
      });
      return Promise.all(promises);
    }
    case TaskType.OutputOnly: {
      const promises: Promise<void>[] = [];
      promises.push(downloadTaskChecker(dir, task));
      task.subtasks.forEach((subtask) => {
        subtask.data.forEach((data) => {
          promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
        });
      });
      return Promise.all(promises);
    }
    default:
      throw new UnreachableError(task);
  }
}

async function downloadTaskChecker(directory: string, task: JudgeTask) {
  const checker = task.checker;
  if (checker.kind === CheckerKind.Custom) {
    await downloadTaskFile(directory, checker.script.file_name, checker.script.file_hash);
  }
}

async function downloadTaskFile(directory: string, filename: string, hash: string) {
  const client = TaskFileStorage.getBlobClient(hash);
  await client.downloadToFile(path.join(directory, filename));
}

async function downloadSubmissionFile(directory: string, filename: string, hash: string) {
  const client = SubmissionFileStorage.getBlobClient(hash);
  await client.downloadToFile(path.join(directory, filename));
}

type CompileSpec = {
  getExecutableName(source: string): string;
  getCompileCommand(source: string, exe: string): string[] | null;
};

const COMPILE_SPECS: Record<JudgeLanguage, CompileSpec> = {
  [Language.Python3]: {
    getExecutableName: (source: string) => {
      return source;
    },
    getCompileCommand: (source: string, exe: string) => {
      return [];
    },
  },
  [Language.CPP]: {
    getExecutableName: (source: string) => {
      return removeLastExtension(source);
    },
    getCompileCommand: (source: string, exe: string) => {
      return ["/usr/bin/g++", "-O2", "-std=c++11", "-o", exe, source];
    },
  },
};

async function compileTaskScript(directory: string, script: JudgeScript): Promise<JudgeScript> {
  const srcpath = path.join(directory, script.file_name);
  const specs = COMPILE_SPECS[script.language];
  const exepath = specs.getExecutableName(srcpath);
  const compileCmd = specs.getCompileCommand(srcpath, exepath);
  if (compileCmd) {
    await runCompiler(compileCmd[0], compileCmd.slice(1));
  }
  script.exe_name = exepath;
  return script;
}

function removeLastExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

function runCompiler(binary: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = ChildProcess.spawn(binary, args);

    child.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}
