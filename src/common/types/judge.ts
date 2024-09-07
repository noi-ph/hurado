import { CheckerKind, Language, JudgeLanguage, TaskType, Verdict } from "./constants";

export type JudgeTask = JudgeTaskBatch | JudgeTaskOutput | JudgeTaskCommunication;

export type JudgeTaskBatch = {
  type: TaskType.Batch;
  subtasks: JudgeSubtaskBatch[];
  checker: JudgeChecker;
  scripts: JudgeScript[];
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
  judge_file_name: string;
  judge_file_hash: string;
};

export type JudgeTaskOutput = {
  type: TaskType.OutputOnly;
  subtasks: JudgeSubtaskOutput[];
  checker: JudgeChecker;
  scripts: JudgeScript[];
};

export type JudgeSubtaskOutput = {
  id: string;
  score_max: number;
  data: JudgeTaskDataOutput[];
};

export type JudgeTaskDataOutput = {
  id: string;
  judge_file_name: string;
  judge_file_hash: string;
};

export type JudgeTaskCommunication = {
  type: TaskType.Communication;
  subtasks: JudgeSubtaskCommunication[];
  checker: JudgeChecker;
  communicator: JudgeScript;
  scripts: JudgeScript[];
};

export type JudgeSubtaskCommunication = {
  id: string;
  score_max: number;
  data: JudgeTaskDataCommunication[];
};

export type JudgeTaskDataCommunication = {
  id: string;
  input_file_name: string;
  input_file_hash: string;
  judge_file_name: string;
  judge_file_hash: string;
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

export type JudgeChecker = JudgeCheckerStandard | JudgeCheckerCustom;

export type JudgeCheckerStandard = {
  kind: Exclude<CheckerKind, CheckerKind.Custom>;
};

export type JudgeCheckerCustom = {
  kind: CheckerKind.Custom;
  script: JudgeScript;
};

export type JudgeScript = {
  id: string;
  language: JudgeLanguage;
  file_name: string;
  file_hash: string;
  argv: string[];
  exe_name: string | null;
};
