import { Language, TaskType, Verdict } from "./constants";

export type JudgeTask = JudgeTaskBatch | JudgeTaskOutput;

export type JudgeTaskBatch = {
  type: TaskType.Batch;
  subtasks: JudgeSubtaskBatch[];
};

export type JudgeSubtaskBatch = {
  id: string;
  score_max: number;
  data: JudgeTaskDataBatch[];
};

export type JudgeTaskDataBatch = {
  id: string;
  input_file_name: string;
  input_file_hash: string;
  output_file_name: string;
  output_file_hash: string;
  judge_file_name: string | null;
  judge_file_hash: string | null;
};

export type JudgeTaskOutput = {
  type: TaskType.OutputOnly;
  subtasks: JudgeSubtaskOutput[];
};

export type JudgeSubtaskOutput = {
  id: string;
  score_max: number;
  data: JudgeTaskDataOutput[];
};

export type JudgeTaskDataOutput = {
  id: string;
  output_file_name: string;
  output_file_hash: string;
  judge_file_name: string | null;
  judge_file_hash: string | null;
};


export type JudgeSubmission = {
  id: string;
  task_id: string;
  files: JudgeSubmissionFile[];
  language: Language;
};

type JudgeSubmissionFile = {
  hash: string;
  file_name: string | null;
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
