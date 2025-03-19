import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { UnreachableDefault } from "common/errors";
import { REDIS_HOST, REDIS_PORT } from "server/secrets";
import { judgeSubmission } from "server/logic/submissions/judge_submission";
import { resetPassword } from "server/logic/users";
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
  maxRetriesPerRequest: null, // Keep trying to reconnect forever
});

// Create a new worker that processes jobs from the 'my-queue' queue
const worker = new Worker(__MAIN_QUEUE_NAME__, handleIncomingJob, {
  connection,
  lockDuration: 120000, // 120s
  maxStalledCount: 3, // Only allow 3 stalled job before marking it as failed
});

// Handle worker events (optional)
worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

async function handleIncomingJob(job: Job) {
  console.log(`Processing job ${job.id}:`, job.name, job.data);
  const name: JobName = job.name as JobName;
  switch (name) {
    case JobName.SubmissionJudgement:
      return handleSubmissionJudgement(job.data);
    case JobName.PasswordReset:
      return handlePasswordReset(job.data);
    default:
      console.error(`Invalid job name: ${UnreachableDefault(name)} -- ${JSON.stringify(job.data)}`);
      return;
  }
}

async function handleSubmissionJudgement(data: SubmissionJudgementData) {
  return judgeSubmission(data.id);
}

async function handlePasswordReset(data: PasswordResetData) {
  return resetPassword(data.username);
}
