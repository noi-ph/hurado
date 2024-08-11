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

export type TaskCredit = Omit<TaskCreditTable, "id">;

export enum TaskEditorAttachmentKind {
  Saved = "Saved",
  Pending = "Pending",
}

export type TaskEditorAttachment = TaskEditorAttachmentSaved | TaskEditorAttachmentPending;

export type TaskEditorAttachmentSaved = {
  kind: TaskEditorAttachmentKind.Saved;
  id: string;
  path: string;
};

export type TaskEditorAttachmentPending = {
  kind: TaskEditorAttachmentKind.Pending;
  file: File;
  path: string;
};

export type TaskEditorTask = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  statement: string;
  credits: TaskCredit[];
  attachments: TaskEditorAttachment[];
};
