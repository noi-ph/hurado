import { Queue } from "bullmq";
import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "server/secrets";
import { __MAIN_QUEUE_NAME__, JobName, PasswordResetData, SubmissionJudgementData } from "./types";

const connection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  retryStrategy(times) {
    return Math.min(times * 100, 3000); // Max wait 3s
  },
  reconnectOnError(err) {
    console.error("Redis error:", err);
    return true; // Force reconnection on error
  },
  maxRetriesPerRequest: 20, // Try every command 20 times before failing
});

export const JobQueue = new Queue(__MAIN_QUEUE_NAME__, { connection });

export async function enqueueSubmissionJudgement(data: SubmissionJudgementData) {
  return await JobQueue.add(JobName.SubmissionJudgement, data, {
    removeOnComplete: true,
    removeOnFail: 100,
  });
}

export async function enqueuePasswordReset(data: PasswordResetData) {
  return await JobQueue.add(JobName.PasswordReset, data, {
    removeOnComplete: true,
    removeOnFail: 100,
  });
}
