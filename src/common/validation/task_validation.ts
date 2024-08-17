import z from 'zod';

export type TaskDTO = z.infer<typeof zTaskSchema>;
export type TaskCreditDTO = z.infer<typeof zTaskCredit>;
export type TaskAttachmentDTO = z.infer<typeof zTaskAttachment>;
export type TaskSubtaskDTO = z.infer<typeof zTaskSubtask>;
export type TaskDataDTO = z.infer<typeof zTaskData>;


const zTaskCredit = z.object({
  id: z.string().optional(),
  name: z.string(),
  role: z.string(),
});

const zTaskAttachment = z.object({ 
  id: z.string().optional(),
  path: z.string(),
  mime_type: z.string(),
  file_hash: z.string(),
});

const zTaskData = z.object({ 
  id: z.string().optional(),
  name: z.string(),
  is_sample: z.boolean(),
  input_file_hash: z.string(),
  input_file_name: z.string(),
  output_file_hash: z.string(),
  output_file_name: z.string(),
  judge_file_hash: z.string().nullable(),
  judge_file_name: z.string().nullable(),
});

const zTaskSubtask = z.object({ 
  id: z.string().optional(),
  name: z.string(),
  score_max: z.number(),
  data: z.array(zTaskData),
});

export const zTaskSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  statement: z.string(),
  score_max: z.number(),
  checker: z.string(),
  credits: z.array(zTaskCredit),
  attachments: z.array(zTaskAttachment),
  subtasks: z.array(zTaskSubtask),
});
