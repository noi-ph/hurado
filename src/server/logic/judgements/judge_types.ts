export type JudgeTask = {
  subtasks: JudgeSubtask[];
};

export type JudgeSubtask = {
  id: string;
  score_max: number;
  data: JudgeData[];
};

export type JudgeData = {
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
  runtime_args: string | null;
};


export type JudgeVerdict = {
  raw_score: number;
  subtasks: JudgeVerdictSubtask[];
};

export type JudgeVerdictSubtask = {
  subtask_id: string;
  score: number;
};

