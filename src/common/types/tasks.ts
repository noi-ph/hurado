import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { CheckerKind, JudgeLanguage, Language, TaskFlavor, TaskType } from "./constants";

export type FileTable = {
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
  time_limit_ms: number | null;
  memory_limit_byte: number | null;
  compile_time_limit_ms: number | null;
  compile_memory_limit_byte: number | null;
  submission_size_limit_byte: number | null;
  checker_kind: CheckerKind;
  checker_id: string | null;
  communicator_id: string | null;
  created_at: Generated<Date>;
  owner_id: string;
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
  file_name: string;
  file_hash: string;
  language: JudgeLanguage;
  argv: string[] | null;
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
  input_file_name: string | null;
  input_file_hash: string | null;
  judge_file_name: string;
  judge_file_hash: string;
};

export type TaskSampleIOTable = {
  id: Generated<string>;
  task_id: string;
  order: number;
  input: string;
  output: string;
  explanation: string;
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
  sample_IO: TaskViewerSampleIO_DTO[];
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

export type TaskViewerSampleIO_DTO = {
  input: string;
  output: string;
  explanation: string;
};

export type TaskSummaryDTO = Pick<Task, "title" | "slug" | "description">;
export type TaskLookupDTO = Pick<Task, "id" | "slug" | "title">;
