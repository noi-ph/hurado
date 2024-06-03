import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Models {
  users: UserTable;
  tasks: TaskTable;
  files: FileTable;
  scripts: ScriptTable;
}

export type UserTable = {
  id: Generated<string>;
  email: string;
  username: string;
  hashed_password: ColumnType<string, string, never>;
  created_at: ColumnType<Date, never, never>;
  school: string | null;
  name: string | null;
};

export type TaskTable = {
  slug: string;
  title: string;
  description?: string;
  statement: string;
  score_max: number;
};

export type FileTable = {
  id: string;
  name: string;
  size: number;
  blob_url: string;
};

export type ScriptTable = {
  id: string;
  file_id: string;
  language_code: string;
  runtime_args: string;
};

export type User = Selectable<UserTable>;
export type UserPublic = Pick<User, "id" | "email" | "username" | "name">;
export type UserCreate = Pick<Insertable<UserTable>, "email" | "username" | "hashed_password">;
export type UserUpdate = Updateable<UserTable>;

export type Task = Selectable<TaskTable>;
export type TaskCreate = Insertable<TaskTable>;
export type TaskUpdate = Updateable<TaskTable>;
