import { Generated, Insertable, Selectable, Updateable } from "kysely";

export type TaskTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description?: string;
  statement: string;
  score_max: number;
};

export type FileTable = {
  id: string;
  name: string;
  size: number;
  blob_url: string;
};

export type ScriptTable = {
  id: string;
  file_id: string;
  language_code: string;
  runtime_args: string;
};

export type Task = Selectable<TaskTable>;
export type TaskCreate = Insertable<TaskTable>;
export type TaskUpdate = Updateable<TaskTable>;
export type TaskSummary = Pick<Task, "title" | "slug" | "description">;
