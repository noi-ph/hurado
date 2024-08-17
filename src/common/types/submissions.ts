import { ColumnType, Generated } from "kysely";

export type SubmissionTable = {
  id: Generated<string>;
  user_id: string;
  task_id: string;
  file_hash: string;
  language: string;
  runtime_args: string | null;
  created_at: ColumnType<Date, never, never>;
  official_result_id: string | null;
};
