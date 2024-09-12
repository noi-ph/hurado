import { z } from "zod";
import { REGEX_SLUG } from "./common_validation";

export type ContestAttachmentDTO = z.infer<typeof zContestAttachment>;
export type ContestTaskDTO = z.infer<typeof zContestTask>;
export type ContestDTO = z.infer<typeof zContest>;

const zContestAttachment = z.object({
  id: z.string().uuid().optional(),
  path: z.string().min(1),
  mime_type: z.string(),
  file_hash: z.string().min(1),
});

const zContestTask = z.object({
  task_id: z.string().uuid(),
  letter: z.string().uuid(),
});

export const zContest = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).regex(REGEX_SLUG),
  title: z.string().min(1),
  description: z.string().nullable(),
  is_public: z.boolean(),
  start_time: z.date().nullable(),
  end_time: z.date().nullable(),
  attachments: z.array(zContestAttachment),
  tasks: z.array(zContestTask),
});
