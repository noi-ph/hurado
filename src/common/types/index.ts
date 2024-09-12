import {
  FileTable,
  TaskScriptTable,
  TaskAttachmentTable,
  TaskCreditTable,
  TaskDataTable,
  TaskSubtaskTable,
  TaskTable,
} from "./tasks";
import { SubmissionFileTable, SubmissionTable } from "./submissions";
import { VerdictSubtaskTable, VerdictTable, VerdictTaskDataTable } from "./verdicts";
import { UserTable } from "./users";
import {
  ContestAttachmentTable,
  ContestTable,
  ContestTaskTable,
  ParticipationTable,
} from "./contests";

export interface Models {
  users: UserTable;
  files: FileTable;
  tasks: TaskTable;
  task_credits: TaskCreditTable;
  task_attachments: TaskAttachmentTable;
  task_subtasks: TaskSubtaskTable;
  task_data: TaskDataTable;
  task_scripts: TaskScriptTable;
  submissions: SubmissionTable;
  submission_files: SubmissionFileTable;
  verdicts: VerdictTable;
  verdict_subtasks: VerdictSubtaskTable;
  verdict_task_data: VerdictTaskDataTable;
  contests: ContestTable;
  contest_attachments: ContestAttachmentTable;
  contest_tasks: ContestTaskTable;
  participation: ParticipationTable;
}

export * from "./users";
export * from "./tasks";
export * from "./submissions";
export * from "./contests";
export * from "./auth";
