import fs from "fs";
import os from "os";
import path from "path";
import { TaskType } from "common/types/constants";
import { JudgeSubmission, JudgeTask } from "common/types/judge";
import { SubmissionFileStorage, TaskFileStorage } from "server/files";
import { UnreachableError } from "common/errors";
import { getLanguageFilename } from "server/evaluation";

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
    switch(task.type) {
      case TaskType.Batch: {
        const promises: Promise<void>[] = [];
        task.subtasks.forEach((subtask) => {
          subtask.data.forEach((data) => {
            promises.push(downloadTaskFile(dir, data.input_file_name, data.input_file_hash));
            promises.push(downloadTaskFile(dir, data.output_file_name, data.output_file_hash));
            if (data.judge_file_name && data.judge_file_hash) {
              promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
            }
          });
        });
        return Promise.all(promises);
      }
      case TaskType.OutputOnly: {
        const promises: Promise<void>[] = [];
        task.subtasks.forEach((subtask) => {
          subtask.data.forEach((data) => {
            promises.push(downloadTaskFile(dir, data.output_file_name, data.output_file_hash));
            if (data.judge_file_name && data.judge_file_hash) {
              promises.push(downloadTaskFile(dir, data.judge_file_name, data.judge_file_hash));
            }
          });
        });
        return Promise.all(promises);
      }
      default:
        throw new UnreachableError(task);
    }
  }

  static async setupSubmission(submission: JudgeSubmission, dir: string): Promise<unknown> {
    return Promise.all(submission.files.map(file => {
      const filename = file.file_name == null
        ? getLanguageFilename(submission.language)
        : file.file_name;
      return downloadSubmissionFile(dir, filename, file.hash);
    }));
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

async function downloadTaskFile(directory: string, filename: string, hash: string) {
  const client = TaskFileStorage.getBlobClient(hash);
  await client.downloadToFile(path.join(directory, filename));
}

async function downloadSubmissionFile(directory: string, filename: string, hash: string) {
  const client = SubmissionFileStorage.getBlobClient(hash);
  await client.downloadToFile(path.join(directory, filename));
}

