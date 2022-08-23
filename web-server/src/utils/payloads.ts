export type FilePayload = {
  name: string;
  file: any;
}

export type ScriptPayload = {
  file: FilePayload;
  languageCode: string;
  runtimeArgs: string;
}

export type TaskPayload = {
  title: string;
  slug: string;
  statement: string;
  description?: string;
  allowedLanguages: string;
  taskType: string;
  scoreMax: number;
  checker: ScriptPayload;
  timeLimit: number;
  memoryLimit: number;
  compileTimeLimit: number;
  compileMemoryLimit: number;
  submissionSizeLimit: number;
  validator: ScriptPayload;
  isPublicInArchive: boolean;
  language: string;
}

export type SubmissionPayload = {
  taskId: number;
  languageCode: string;
}

export type SubmissionFilePayload = {
  submission: SubmissionPayload;
  file: FilePayload;
  submissionId: number;
  fileId: number;
}