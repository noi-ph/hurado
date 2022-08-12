export type File = {
  url: string;
};
export type Script = {
  file: File;
};
export type Task = {
  id: number;
  title: string;
  slug: string;
};
