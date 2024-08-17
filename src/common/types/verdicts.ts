import { ColumnType, Generated } from "kysely";
import { Language } from "./languages";

export type VerdictTable = {
  id: Generated<string>;
  submission_id: string;
  created_at: ColumnType<Date, never, never>;
  verdict: string;
  raw_score: number;
  is_official: boolean;
  running_time_ms: number;
  running_memory_byte: number;
  compile_time_ms: number;
  compile_memory_byte: number;
};

export type VerdictSubtaskTable = {
  id: Generated<string>;
  verdict_id: string;
  subtask_id: string;
  created_at: ColumnType<Date, never, never>;
  verdict: string;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
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
