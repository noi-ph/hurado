import fs from "fs";
import path from "path";
import { TaskType } from "common/types/constants";
import { JudgeScript, JudgeSubmission, JudgeTask } from "common/types/judge";
import { SubmissionFileStorage, TaskFileStorage } from "server/files";
import { UnreachableError } from "common/errors";
import { compileJudgeScriptAndMutate, getLanguageFilename } from "server/evaluation";

const TASK_ROOT_DIRECTORY = "/var/hurado/tasks";
const SUBMISSION_ROOT_DIRECTORY = "/tmp/submissions";
const OUTPUT_ROOT_DIRECTORY = "/tmp/outputs";

// TODO: Setup some sort of caching for task data so hundreds of megabytes
// aren't downloaded every time someone submits code
export class JudgeFiles {
  static async cleanDirectory(path: string): Promise<void> {
    await fs.promises.rm(path, { recursive: true });
  }

  static async setupTask(task: JudgeTask): Promise<string> {
    const root = path.join(TASK_ROOT_DIRECTORY, task.id);
    await fs.promises.mkdir(root, { mode: 0o777, recursive: true });
    await fs.promises.chmod(root, 0o777); // NodeJS seems to ignore mode on mkdir
    await downloadTaskFiles(task, root);
    await compileTaskScripts(task, root);
    return root;
  }

  static async setupOutput(submission: JudgeSubmission): Promise<string> {
    const root = path.join(OUTPUT_ROOT_DIRECTORY, submission.id);
    await fs.promises.mkdir(root, { mode: 0o777, recursive: true });
    await fs.promises.chmod(root, 0o777); // NodeJS seems to ignore mode on mkdir
    return root;
  }

  static async setupSubmission(submission: JudgeSubmission): Promise<string> {
    const root = path.join(SUBMISSION_ROOT_DIRECTORY, submission.id);
    await fs.promises.mkdir(root, { mode: 0o777, recursive: true });
    await fs.promises.chmod(root, 0o777); // NodeJS seems to ignore mode on mkdir

    await Promise.all(
      submission.files.map((file) => {
        const filename =
          file.file_name == null ? getLanguageFilename(submission.language) : file.file_name;
        return downloadSubmissionFile(root, filename, file.hash);
      })
    );

    return root;
  }
}

async function downloadTaskFiles(task: JudgeTask, dir: string): Promise<unknown> {
  switch (task.type) {
    case TaskType.Batch: {
      const promises: Promise<unknown>[] = [];
      promises.push(downloadTaskScripts(dir, task.scripts));
      task.subtasks.forEach((subtask) => {
        subtask.data.forEach((data) => {
          promises.push(downloadTaskFile(dir, data.input_file_name, data.input_file_hash));
          promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
        });
      });
      return Promise.all(promises);
    }
    case TaskType.OutputOnly: {
      const promises: Promise<unknown>[] = [];
      promises.push(downloadTaskScripts(dir, task.scripts));
      task.subtasks.forEach((subtask) => {
        subtask.data.forEach((data) => {
          promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
        });
      });
      return Promise.all(promises);
    }
    case TaskType.Communication: {
      const promises: Promise<unknown>[] = [];
      promises.push(downloadTaskScripts(dir, task.scripts));
      task.subtasks.forEach((subtask) => {
        subtask.data.forEach((data) => {
          promises.push(downloadTaskFile(dir, data.input_file_name, data.input_file_hash));
          promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
        });
      });
      return Promise.all(promises);
    }
    default:
      throw new UnreachableError(task);
  }
}

async function downloadTaskScripts(directory: string, scripts: JudgeScript[]): Promise<unknown[]> {
  return Promise.all(
    scripts.map((script) => downloadTaskFile(directory, script.file_name, script.file_hash))
  );
}

async function downloadTaskFile(directory: string, filename: string, hash: string) {
  const dest = path.join(directory, filename);
  await TaskFileStorage.downloadToFile(hash, dest);
}

async function downloadSubmissionFile(directory: string, filename: string, hash: string) {
  const dest = path.join(directory, filename);
  await SubmissionFileStorage.downloadToFile(hash, dest);
}

async function compileTaskScripts(task: JudgeTask, dir: string): Promise<unknown> {
  return Promise.all(task.scripts.map((script) => compileJudgeScriptAndMutate(script, dir)));
}
