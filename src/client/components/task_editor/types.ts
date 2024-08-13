// These ED types represent the internal state of the task editor
export enum EditorKind {
  Saved = "Saved",
  Local = "Local",
}

export type TaskED = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  statement: string;
  checker: string;
  credits: TaskCreditED[];
  attachments: TaskAttachmentED[];
  subtasks: TaskSubtaskED[];
  files: TaskFileSaved[];
};


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
  test_data: TaskTestDataED[];
  deleted: boolean;
};

export type TaskSubtaskLocal = {
  kind: EditorKind.Local;
  name: string;
  score_max: number;
  test_data: TaskTestDataED[];
  deleted: boolean;
};

export type TaskSubtaskED = TaskSubtaskSaved | TaskSubtaskLocal;

export type TaskFileSaved = {
  kind: EditorKind.Saved;
  id: string;
  hash: string;
};

export type TaskFileLocal = {
  kind: EditorKind.Local;
  file: File;
  hash: string;
};

export type TaskFileED = TaskFileSaved | TaskFileLocal;

export type TaskTestDataSaved = {
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

export type TaskTestDataLocal = {
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

export type TaskTestDataED = TaskTestDataSaved | TaskTestDataLocal;