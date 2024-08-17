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
  scripts: ScriptTable;
  submissions: SubmissionTable;
  verdicts: VerdictTable;
  verdict_subtasks: VerdictSubtaskTable;
  verdict_task_data: VerdictTaskDataTable;
}

export * from "./users";
export * from "./tasks";
export * from "./auth";
