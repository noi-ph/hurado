import z from 'zod';

export type SubmissionRequestDTO = z.infer<typeof zSubmissionRequest>;

export const zSubmissionRequest = z.object({
  task_id: z.string(),
  language: z.string(),
});
