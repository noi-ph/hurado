import { Selectable, ColumnType, Generated, Insertable, Updateable } from "kysely";

export type UserTable = {
  id: Generated<string>;
  email: string;
  username: string;
  hashed_password: ColumnType<string, string, never>;
  created_at: ColumnType<Date, never, never>;
  school: string | null;
  name: string | null;
};

export type User = Selectable<UserTable>;
export type UserPublic = Pick<User, "id" | "email" | "username" | "name">;
export type UserCreate = Pick<Insertable<UserTable>, "email" | "username" | "hashed_password">;
export type UserUpdate = Updateable<UserTable>;
