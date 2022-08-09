export type Task = {
  title: string;
  slug: string;
  description: string;
  statement: string;
  allowedLanguages: string;
  taskType: string;
  scoreMax: number;
  checker: string;
  timeLimit: number;
  memoryLimit: number;
  compileTimeLimit: number;
  compileMemoryLimit: number;
  submissionSizeLimit: number;
  validator: string;
  isPublicInArchive: boolean;
  language: string;
};