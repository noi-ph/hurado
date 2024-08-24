import { ColumnType, Generated } from "kysely";
import { Language, Verdict } from "./constants";

export type SubmissionTable = {
  id: Generated<string>;
  user_id: string;
  task_id: string;
  language: string;
  created_at: ColumnType<Date, never, never>;
  official_verdict_id: string | null;
};

export type SubmissionFileTable = {
  hash: string;
  size: number;
  submission_id: string;
  file_name: string | null;
};

export type SubmissionSummaryDTO = {
  id: string;
  language: Language;
  username: string | null;
  created_at: Date;
  verdict_id: string | null;
  verdict: Verdict | null;
  score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
};

export type SubmissionViewerDTO = {
  id: string;
  language: Language;
  created_at: Date;
  verdict: VerdictViewerDTO | null;
  task_id: string;
  task_slug: string;
  task_title: string;
  files: SubmissionFileDTO[];
};

export type SubmissionFileDTO = {
  content: string;
  file_name: string | null;
};

export type VerdictViewerDTO = {
  verdict: Verdict | null;
  raw_score: number | null;
  max_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
  compile_time_ms: number | null;
  compile_memory_byte: number | null;
  subtasks: VerdictSubtaskViewerDTO[];
};

export type VerdictSubtaskViewerDTO = {
  verdict: Verdict | null;
  raw_score: number | null;
  max_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
  data: VerdictTaskDataViewerDTO[];
};

export type VerdictTaskDataViewerDTO = {
  verdict: Verdict | null;
  raw_score: number | null;
  running_time_ms: number | null;
  running_memory_byte: number | null;
};
