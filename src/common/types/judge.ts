import { Language, Verdict } from "./constants";

export type JudgeTask = {
  subtasks: JudgeSubtask[];
};

export type JudgeSubtask = {
  id: string;
  score_max: number;
  data: JudgeTaskData[];
};

export type JudgeTaskData = {
  id: string;
  input_file_name: string;
  input_file_hash: string;
  output_file_name: string;
  output_file_hash: string;
  judge_file_name: string | null;
  judge_file_hash: string | null;
};

export type JudgeSubmission = {
  id: string;
  task_id: string;
  file_hash: string;
  language: string;
};

export type JudgeVerdict = {
  id: string;
  submission_id: string;
  created_at: Date;
  is_official: boolean;
  verdict: Verdict;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
  subtasks: JudgeVerdictSubtask[];
};

export type JudgeVerdictSubtask = {
  id: string;
  subtask_id: string;
  created_at: Date;
  verdict: Verdict;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
  data: JudgeVerdictTaskData[];
};

export type JudgeVerdictTaskData = {
  id: string;
  task_data_id: string;
  created_at: Date;
  verdict: Verdict;
  raw_score: number;
  running_time_ms: number;
  running_memory_byte: number;
};
