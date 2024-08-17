import { ColumnType, Generated } from "kysely";
import { Language } from "./languages";

export type SubmissionTable = {
  id: Generated<string>;
  user_id: string;
  task_id: string;
  file_hash: string;
  language: string;
  runtime_args: string | null;
  created_at: ColumnType<Date, never, never>;
  official_verdict_id: string | null;
};

export type SubmissionSummaryDTO = {
  id: string;
  language: Language;
  created_at: Date;
  verdict: string | null;
  score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
}
