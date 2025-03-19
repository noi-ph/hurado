import { z } from "zod";
import { Contest } from "common/types";
import { REGEX_SLUG } from "./common_validation";

export type ContestAttachmentUpdateDTO = z.infer<typeof zContestAttachment>;
export type ContestTaskUpdateDTO = z.infer<typeof zContestTask>;
export type ContestUpdateDTO = z.infer<typeof zContest>;

const zContestAttachment = z.object({
  id: z.string().uuid().optional(),
  path: z.string().min(1),
  mime_type: z.string(),
  file_hash: z.string().min(1),
});

const zContestTask = z.object({
  task_id: z.string().uuid(),
  letter: z.string().min(1),
  score_max: z.number(),
});

export const zContest = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).regex(REGEX_SLUG),
  title: z.string().min(1),
  description: z.string(),
  statement: z.string(),
  is_public: z.boolean(),
  start_time: z.date().nullable(),
  end_time: z.date().nullable(),
  attachments: z.array(zContestAttachment),
  tasks: z.array(zContestTask),
});

type ContestEditorKeys =
  | "id"
  | "slug"
  | "title"
  | "description"
  | "statement"
  | "start_time"
  | "end_time"
  | "owner_id"
  | "is_public";

export type ContestTaskEditorDTO = {
  task_id: string;
  slug: string;
  title: string;
  score_max: number;
  letter: string;
  order: number;
};

export type ContestAttachmentEditorDTO = {
  id: string;
  path: string;
  file_hash: string;
  mime_type: string;
};

export type ContestEditorDTO = Pick<Contest, ContestEditorKeys> & {
  attachments: ContestAttachmentEditorDTO[];
  tasks: ContestTaskEditorDTO[];
};

export const zContestCreate = zContest.pick({
  slug: true,
  title: true,
});
