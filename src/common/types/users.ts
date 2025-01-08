import { Selectable, ColumnType, Generated, Insertable, Updateable } from "kysely";

export type UserTable = {
  id: Generated<string>;
  email: string;
  username: string;
  hashed_password: ColumnType<string, string, never>;
  created_at: ColumnType<Date, never, never>;
  school: string | null;
  name: string | null;
  role: string;
};

export type User = Selectable<UserTable>;
export type UserPublic = Pick<User, "id" | "email" | "username" | "name" | "role">;
