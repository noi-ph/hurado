import { Worker, Job } from 'bullmq';
import { StandaloneConnectionOptions } from 'ioredis';
import { UnreachableDefault } from 'common/errors';
import { REDIS_HOST, REDIS_PORT } from 'server/secrets';
import { judgeSubmission } from 'server/logic/submissions/judge_submission';
import { resetPassword } from 'server/logic/users';
import { __MAIN_QUEUE_NAME__, JobName, PasswordResetData, SubmissionJudgementData } from './types';

const connection: StandaloneConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

// Create a new worker that processes jobs from the 'my-queue' queue
const worker = new Worker(__MAIN_QUEUE_NAME__, handleIncomingJob, { connection });

// Handle worker events (optional)
worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});


async function handleIncomingJob(job: Job) {
  console.log(`Processing job ${job.id}:`, job.name, job.data);
  const name: JobName = job.name as JobName;
  switch(name) {
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
