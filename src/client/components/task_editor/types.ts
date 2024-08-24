import { CheckerKind, Language, TaskType } from "common/types/constants";

// These ED types represent the internal state of the task editor
export enum EditorKind {
  Saved = "Saved",
  Local = "Local",
}

export type TaskED = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  statement: string;
  type: TaskType;
  checker: TaskCheckerED;
  credits: TaskCreditED[];
  attachments: TaskAttachmentED[];
  subtasks: TaskSubtaskED[];
};

type TaskCheckerED = {
  kind: Exclude<CheckerKind, CheckerKind.Custom>,
} | {
  kind: CheckerKind.Custom,
  script: TaskScriptED;
}

export type TaskScriptED = TaskScriptSaved | TaskScriptLocal;

type TaskScriptSaved = {
  kind: EditorKind.Saved;
  id: string;
  file_name: string;
  file_hash: string;
  language: Language;
  argv: string[];
}

type TaskScriptLocal = {
  kind: EditorKind.Local;
  id: string;
  file_name: string;
  file_hash: string;
  language: Language;
  argv: string[];
}

export type TaskCreditSaved = {
  kind: EditorKind.Saved;
  id: string;
  name: string;
  role: string;
  deleted: boolean;
};

export type TaskCreditLocal = {
  kind: EditorKind.Local;
  name: string;
  role: string;
  deleted: boolean;
};

export type TaskCreditED = TaskCreditSaved | TaskCreditLocal;

export type TaskAttachmentSaved = {
  kind: EditorKind.Saved;
  id: string;
  path: string;
  mime_type: string;
  file: TaskFileED | null;
  deleted: boolean;
};

export type TaskAttachmentLocal = {
  kind: EditorKind.Local;
  path: string;
  mime_type: string;
  filename: string;
  file: TaskFileED | null;
  deleted: boolean;
};

export type TaskAttachmentED = TaskAttachmentSaved | TaskAttachmentLocal;

export type TaskSubtaskSaved = {
  kind: EditorKind.Saved;
  id: string;
  name: string;
  score_max: number;
  data: TaskDataED[];
  deleted: boolean;
};

export type TaskSubtaskLocal = {
  kind: EditorKind.Local;
  name: string;
  score_max: number;
  data: TaskDataED[];
  deleted: boolean;
};

export type TaskSubtaskED = TaskSubtaskSaved | TaskSubtaskLocal;

export type TaskFileSaved = {
  kind: EditorKind.Saved;
  hash: string;
};

export type TaskFileLocal = {
  kind: EditorKind.Local;
  file: File;
  hash: string;
};

export type TaskFileED = TaskFileSaved | TaskFileLocal;

export type TaskDataSaved = {
  kind: EditorKind.Saved;
  id: string;
  name: string;
  input_file_name: string;
  input_file: TaskFileED | null;
  output_file_name: string;
  output_file: TaskFileED | null;
  judge_file_name: string | null;
  judge_file: TaskFileED | null;
  is_sample: boolean;
  deleted: boolean;
};

export type TaskDataLocal = {
  kind: EditorKind.Local;
  name: string;
  input_file_name: string;
  input_file: TaskFileED | null;
  output_file_name: string;
  output_file: TaskFileED | null;
  judge_file_name: string | null;
  judge_file: TaskFileED | null;
  is_sample: boolean;
  deleted: boolean;
};

export type TaskDataED = TaskDataSaved | TaskDataLocal;