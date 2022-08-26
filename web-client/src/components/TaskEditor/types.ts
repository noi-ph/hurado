export enum TaskEditorTab {
  Statement = 'Statement',
  Details = 'Details',
  Judging = 'Judging',
  Permissions = 'Permissions',
  Analysis = 'Analysis',
  Rejudge = 'Rejudge',
}

export type TaskStateStack = {
  stack: TaskState[];
  index: number;
};

export type TaskState = {
  tab: TaskEditorTab;
  slug: string;
  isInPublicArchive: boolean;
};

export enum TaskEditorAction {
  Undo = 'Undo',
  Redo = 'Redo',
  ChangeTab = 'ChangeTab',
  ChangeDetail = 'ChangeDetail',
}

type TaskEditorActionUndo = {
  kind: TaskEditorAction.Undo,
};

type TaskEditorActionRedo = {
  kind: TaskEditorAction.Redo,
};

type TaskEditorActionChangeTab = {
  kind: TaskEditorAction.ChangeTab,
  tab: TaskEditorTab,
};

type TaskEditorActionChangeDetail = {
  kind: TaskEditorAction.ChangeDetail,
  detail: string,
  value: string,
};

export type TaskEditorActionType =
  | TaskEditorActionChangeTab
  | TaskEditorActionChangeDetail;

export type TaskEditorActionTypeWithHistory =
  | TaskEditorActionUndo
  | TaskEditorActionRedo
  | TaskEditorActionType;

export type Task = {
  id: number;
  title: string;
  slug: string;
  description: string;
  allowedLanguages: string;
  taskType: string;
  scoreMax: number;
  timeLimit: number;
  memoryLimit: number;
  compileTimeLimit: number;
  compileMemoryLimit: number;
  submissionSizeLimit: number;
  validatorId: number;
  isPublicInArchive: boolean;
  language: string;
};

export class UnreachableError {
  constructor(_args: never) {
    // pass
  }
}