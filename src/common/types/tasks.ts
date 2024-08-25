import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { CheckerKind, Language, TaskFlavor, TaskType } from "./constants";

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
  is_public: boolean;
  type: TaskType;
  flavor: TaskFlavor | null;
  allowed_languages: Language[] | null;
  score_max: number;
  time_limit_ms: number;
  memory_limit_byte: number;
  compile_time_limit_ms: number | null;
  compile_memory_limit_byte: number | null;
  submission_size_limit_byte: number | null;
  checker_kind: CheckerKind;
  checker_id: string | null;
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

export type TaskScriptTable = {
  id: Generated<string>;
  task_id: string;
  file_hash: string;
  language: string;
  argv: string[];
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
  input_file_name: string | null;
  input_file_hash: string | null;
  output_file_name: string;
  output_file_hash: string;
  judge_file_name: string | null;
  judge_file_hash: string | null;
};

export type Task = Selectable<TaskTable>;
export type TaskCreate = Insertable<TaskTable>;
export type TaskUpdate = Updateable<TaskTable>;
export type TaskCredit = Selectable<TaskCreditTable>;

export type TaskViewerCommonDTO = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  statement: string;
  score_max: number;
  credits: TaskViewerCreditDTO[];
};

export type TaskViewerDTO = TaskViewerBatchDTO | TaskViewerCommunicationDTO | TaskViewerOutputDTO;

export type TaskViewerBatchDTO = TaskViewerCommonDTO & {
  type: TaskType.Batch;
};

export type TaskViewerCommunicationDTO = TaskViewerCommonDTO & {
  type: TaskType.Communication;
};

export type TaskViewerOutputDTO = TaskViewerCommonDTO & {
  type: TaskType.OutputOnly;
  flavor: TaskFlavor;
  subtasks: TaskViewerSubtaskOutputDTO[];
};

export type TaskViewerSubtaskOutputDTO = {
  order: number;
  score_max: number;
  file_name: string;
};

export type TaskViewerCreditDTO = {
  name: string;
  role: string;
};

export type TaskSummaryDTO = Pick<Task, "title" | "slug" | "description">;
