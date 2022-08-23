type Error = {
  status?: any;
}

export type UserError = Error & {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  passwordConfirm?: string;
  country?: string;
};


export type FileError = Error & {
  id?: string;
  name?: string;
  file?: string;
}

export type ScriptError = Error & {
  file?: FileError;
  languageCode?: string;
  runtimeArgs?: string;
}

export type TaskError = Error & {
  title?: string;
  slug?: string;
  statement?: string;
  allowedLanguages?: string;
  taskType?: string;
  scoreMax?: string;
  checker?: ScriptError;
  timeLimit?: string;
  memoryLimit?: string;
  compileTimeLimit?: string;
  compileMemoryLimit?: string;
  submissionSizeLimit?: string;
  validator?: ScriptError;
  isPublicInArchive?: string;
  language?: string;
}

export type SubmissionError = Error & {
  task?: string;
  languageCode?: string;
}

export type SubmissionFileError = Error & {
  submission?: SubmissionError;
  file?: FileError;
};

export type PossibleErrors = UserError | TaskError | FileError | ScriptError;