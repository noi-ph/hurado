import { FileTable, ScriptTable, TaskAttachmentTable, TaskTable } from "./tasks";
import { UserTable } from "./users";

export interface Models {
  users: UserTable;
  tasks: TaskTable;
  task_attachments: TaskAttachmentTable;
  files: FileTable;
  scripts: ScriptTable;
}

export * from "./users";
export * from "./tasks";
export * from "./auth";
