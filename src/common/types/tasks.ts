import { Generated, Insertable, Selectable, Updateable } from "kysely";

export type TaskFileTable = {
  id: Generated<string>;
  hash: string;
  size: number;
};

export type TaskTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description: string | null;
  statement: string;
  score_max: number;
};

export type TaskCreditTable = {
  id: Generated<string>;
  task_id: string;
  name: string;
  role: string;
  order: number;
};

export type TaskAttachmentTable = {
  id: Generated<string>;
  task_id: string;
  path: string;
  mime_type: string;
  file_hash: string;
};

export type TaskSubtaskTable = {
  id: Generated<string>;
  task_id: string;
  name: string;
  order: number;
  score_max: number;
};

export type TaskDataTable = {
  id: Generated<string>;
  subtask_id: string;
  name: string;
  order: number;
  is_sample: boolean;
  input_file_name: string;
  input_file_hash: string;
  output_file_name: string;
  output_file_hash: string;
  judge_file_name: string | null;
  judge_file_hash: string | null;
};

export type ScriptTable = {
  id: string;
  file_hash: string;
  language_code: string;
  runtime_args: string;
};

export type Task = Selectable<TaskTable>;
export type TaskCreate = Insertable<TaskTable>;
export type TaskUpdate = Updateable<TaskTable>;
export type TaskCredit = Selectable<TaskCreditTable>;

export type TaskViewerDTO = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  statement: string;
  score_max: number;
  credits: TaskViewerCreditDTO[];
}

export type TaskViewerCreditDTO = {
  name: string;
  role: string;
}

export type TaskSummaryDTO = Pick<Task, "title" | "slug" | "description">;
