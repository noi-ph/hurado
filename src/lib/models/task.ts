export type Task = {
  slug: string;
  title: string;
  description?: string;
  statement: string;
  score_max: number;
};

export type File = {
  id: string;
  name: string;
  size: number;
  blob_url: string;
};

export type Script = {
  id: string;
  file_id: string;
  language_code: string;
  runtime_args: string;
};
