import { ColumnType, Generated } from "kysely";
import { Verdict } from "./constants";

export type VerdictTable = {
  id: Generated<string>;
  submission_id: string;
  created_at: ColumnType<Date, never, never>;
  is_official: boolean;
  verdict: string | null;
  raw_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
  compile_time_ms: number | null;
  compile_memory_byte: number | null;
};

export type VerdictSubtaskTable = {
  id: Generated<string>;
  verdict_id: string;
  subtask_id: string;
  created_at: ColumnType<Date, never, never>;
  verdict: Verdict | null;
  raw_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
};


export type VerdictTaskDataTable = {
  id: Generated<string>;
  verdict_subtask_id: string;
  task_data_id: string;
  created_at: ColumnType<Date, never, never>;
  verdict: string;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
};
