import {
  TaskFileTable,
  ScriptTable,
  TaskAttachmentTable,
  TaskCreditTable,
  TaskDataTable,
  TaskSubtaskTable,
  TaskTable,
} from "./tasks";
import {
  SubmissionTable,
} from "./submissions";
import { UserTable } from "./users";

export interface Models {
  users: UserTable;
  tasks: TaskTable;
  task_credits: TaskCreditTable;
  task_attachments: TaskAttachmentTable;
  task_subtasks: TaskSubtaskTable;
  task_data: TaskDataTable;
  task_files: TaskFileTable;
  scripts: ScriptTable;
  submissions: SubmissionTable;
}

export * from "./users";
export * from "./tasks";
export * from "./auth";
