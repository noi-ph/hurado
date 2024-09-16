import { CheckerKind, Language, TaskFlavor, TaskType } from "common/types/constants";
import { CommonAttachmentED, CommonFileED, EditorKind } from "../common_editor/types";

export type TaskED = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  statement: string;
  type: TaskType;
  flavor: TaskFlavor | null;
  checker: TaskCheckerED;
  credits: TaskCreditED[];
  attachments: CommonAttachmentED[];
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

export type TaskDataSaved = {
  kind: EditorKind.Saved;
  id: string;
  name: string;
  input_file_name: string | null;
  input_file: CommonFileED | null;
  judge_file_name: string;
  judge_file: CommonFileED | null;
  is_sample: boolean;
  deleted: boolean;
};

export type TaskDataLocal = {
  kind: EditorKind.Local;
  name: string;
  input_file_name: string | null;
  input_file: CommonFileED | null;
  judge_file_name: string;
  judge_file: CommonFileED | null;
  is_sample: boolean;
  deleted: boolean;
};

export type TaskDataED = TaskDataSaved | TaskDataLocal;