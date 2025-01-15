import { Queue } from "bullmq";
import { StandaloneConnectionOptions } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "server/secrets";
import { __MAIN_QUEUE_NAME__, JobName, PasswordResetData, SubmissionJudgementData } from "./types";

const connection: StandaloneConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

export const JobQueue = new Queue(__MAIN_QUEUE_NAME__, { connection });

export async function enqueueSubmissionJudgement(data: SubmissionJudgementData) {
  return await JobQueue.add(JobName.SubmissionJudgement, data);
}

export async function enqueuePasswordReset(data: PasswordResetData) {
  return await JobQueue.add(JobName.PasswordReset, data);
}
