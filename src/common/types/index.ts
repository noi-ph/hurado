import {
  TaskFileTable,
  TaskScriptTable,
  TaskAttachmentTable,
  TaskCreditTable,
  TaskDataTable,
  TaskSubtaskTable,
  TaskTable,
} from "./tasks";
import {
  SubmissionFileTable,
  SubmissionTable,
} from "./submissions";
import {
  VerdictSubtaskTable,
  VerdictTable,
  VerdictTaskDataTable,
} from "./verdicts";
import { UserTable } from "./users";

export interface Models {
  users: UserTable;
  tasks: TaskTable;
  task_credits: TaskCreditTable;
  task_attachments: TaskAttachmentTable;
  task_subtasks: TaskSubtaskTable;
  task_data: TaskDataTable;
  task_files: TaskFileTable;
  task_scripts: TaskScriptTable;
  submissions: SubmissionTable;
  submission_files: SubmissionFileTable;
  verdicts: VerdictTable;
  verdict_subtasks: VerdictSubtaskTable;
  verdict_task_data: VerdictTaskDataTable;
}

export * from "./users";
export * from "./tasks";
export * from "./submissions";
export * from "./auth";
