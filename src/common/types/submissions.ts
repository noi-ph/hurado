import { ColumnType, Generated } from "kysely";
import { Language, Verdict } from "./constants";

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

export type SubmissionViewerDTO = {
  id: string;
  language: Language;
  code: string;
  created_at: Date;
  verdict: VerdictViewerDTO | null;
  task_id: string;
  task_slug: string;
  task_title: string;
}

export type VerdictViewerDTO = {
  verdict: Verdict | null;
  raw_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
  compile_time_ms: number | null;
  compile_memory_byte: number | null;
  subtasks: VerdictSubtaskViewerDTO[];
}

export type VerdictSubtaskViewerDTO = {
  verdict: Verdict | null;
  raw_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
  data: VerdictTaskDataViewerDTO[];
}

export type VerdictTaskDataViewerDTO = {
  verdict: Verdict | null;
  raw_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
}