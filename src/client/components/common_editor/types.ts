// These ED types represent the internal state of the task editor
export enum EditorKind {
  Saved = "Saved",
  Local = "Local",
}

export type CommonAttachmentSaved = {
  kind: EditorKind.Saved;
  id: string;
  path: string;
  mime_type: string;
  file: CommonFileED | null;
  deleted: boolean;
};

export type CommonAttachmentLocal = {
  kind: EditorKind.Local;
  path: string;
  mime_type: string;
  filename: string;
  file: CommonFileED | null;
  deleted: boolean;
};

export type CommonAttachmentED = CommonAttachmentSaved | CommonAttachmentLocal;

export type CommonFileSaved = {
  kind: EditorKind.Saved;
  hash: string;
};

export type CommonFileLocal = {
  kind: EditorKind.Local;
  file: File;
  hash: string;
};

export type CommonFileED = CommonFileSaved | CommonFileLocal;
