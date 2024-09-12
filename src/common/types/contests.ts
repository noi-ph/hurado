import { Generated, Selectable } from "kysely";

export type ContestTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description: string;
  statement: string;
  owner_id: string;
  is_public: boolean;
  start_time: Date | null;
  end_time: Date | null;
};

export type ContestTaskTable = {
  contest_id: string;
  task_id: string;
  letter: string;
  order: number;
};

export type ContestAttachmentTable = {
  id: Generated<string>;
  contest_id: string;
  path: string;
  mime_type: string;
  file_hash: string;
};

export type ParticipationTable = {
  user_id: string;
  contest_id: string;
  is_hidden: boolean;
  is_unrestricted: boolean;
  created_at: Date;
};

export type Contest = Selectable<ContestTable>;
export type ContestSummaryDTO = Pick<Contest, "title" | "slug" | "description">;

type ContestViewerKeys = "id" | "slug" | "title" | "description" | "start_time" | "end_time";
export type ContestViewerDTO = Pick<Contest, ContestViewerKeys>;
