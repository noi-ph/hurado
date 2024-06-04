import { FileTable, ScriptTable, TaskTable } from "./tasks";
import { UserTable } from "./users";

export interface Models {
  users: UserTable;
  tasks: TaskTable;
  files: FileTable;
  scripts: ScriptTable;
}

export * from "./users";
export * from "./tasks";
export * from "./auth";
