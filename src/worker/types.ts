export const __MAIN_QUEUE_NAME__ = 'main';

export enum JobName {
  Debug = 'debug',
  SubmissionJudgement = 'judge',
}

export type SubmissionJudgementData = {
  id: string;
};
