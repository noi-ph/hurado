export type File = {
  url: string;
};
export type Script = {
  file: File;
};
export type Task = {
  id: number;
  title: string;
  slug: string;
  description: string;
  statement: string;
  allowedLanguages: string;
  taskType: string;
  scoreMax: number;
  timeLimit: number;
  memoryLimit: number;
  compileTimeLimit: number;
  compileMemoryLimit: number;
  submissionSizeLimit: number;
  isPublicInArchive: boolean;
  language: string;
};
