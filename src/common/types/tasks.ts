import { Generated, Insertable, Selectable, Updateable } from "kysely";

export type TaskTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description?: string;
  statement: string;
  score_max: number;
};

export type TaskCreditTable = {
  id: string;
  name: string;
  role: string;
};

export type FileTable = {
  id: Generated<string>;
  hash: string;
  size: number;
};

export type TaskAttachmentTable = {
  id: Generated<string>;
  path: string;
  mime_type: string;
  file_hash: string;
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
export type TaskSummary = Pick<Task, "title" | "slug" | "description">;
export type TaskCredit = Selectable<TaskCreditTable>;

// These SSR (Server-Side Rendered) types are expected to be passed in directly from NextJS
// into server components. Minimize the load size and let the client do the computing.
export type TaskSSR = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  statement: string;
  checker: string;
  credits: TaskCreditSSR[];
  attachments: TaskAttachmentSSR[];
  subtasks: TaskSubtaskSSR[];
  files: TaskFileSSR[];
};

export type TaskCreditSSR = {
  id: string;
  name: string;
  role: string;
};

export type TaskAttachmentSSR = {
  id: string;
  path: string;
  file_hash: string;
  mime_type: string;
};

export type TaskFileSSR = {
  id: string;
  hash: string;
};

export type TaskSubtaskSSR = {
  id: string;
  name: string;
  order: number;
  score_max: number;
  test_data: TestDataSSR[];
};

export type TestDataSSR = {
  id: string;
  name: string;
  order: number;
  input_file_hash: string;
  input_file_name: string;
  output_file_hash: string;
  output_file_name: string;
  judge_file_hash: string | null;
  judge_file_name: string | null;
  is_sample: boolean;
};

export type TaskCreditDTO = {
  id?: string;
  name: string;
  role: string;
};

export type TaskAttachmentDTO = {
  id?: string;
  path: string;
  file_hash: string;
  mime_type: string;
};

export type TaskSubtaskDTO = {
  id?: string;
  name: string;
  order: number;
  score_max: number;
  test_data: TaskTestDataDTO[];
};

export type TaskTestDataDTO = {
  id?: string;
  name: string;
  order: number;
  input_file_hash: string;
  input_file_name: string;
  output_file_hash: string;
  output_file_name: string;
  judge_file_hash: string | null;
  judge_file_name: string | null;
  is_sample: boolean;
}

export type TaskDTO = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  statement: string;
  checker: string;
  credits: TaskCreditDTO[];
  attachments: TaskAttachmentDTO[];
  subtasks: TaskSubtaskDTO[];
};

export type TaskFileUploadRequest = {
  task_id: string;
  mime_type: string;
};
