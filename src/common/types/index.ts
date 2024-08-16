import {
  FileTable,
  ScriptTable,
  TaskAttachmentTable,
  TaskCreditTable,
  TaskDataTable,
  TaskSubtaskTable,
  TaskTable,
} from "./tasks";
import { UserTable } from "./users";

export interface Models {
  users: UserTable;
  tasks: TaskTable;
  task_credits: TaskCreditTable;
  task_attachments: TaskAttachmentTable;
  task_subtasks: TaskSubtaskTable;
  task_data: TaskDataTable;
  files: FileTable;
  scripts: ScriptTable;
}

export * from "./users";
export * from "./tasks";
export * from "./auth";
