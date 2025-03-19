export const __MAIN_QUEUE_NAME__ = "main";

export enum JobName {
  SubmissionJudgement = "judge",
  PasswordReset = "password_reset",
}

export type SubmissionJudgementData = {
  id: string;
};

export type PasswordResetData = {
  username: string;
};
