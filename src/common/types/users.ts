// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { Selectable, ColumnType, Generated, Insertable, Updateable } from "kysely";

export type UserTable = {
  id: Generated<string>;
  email: string;
  username: string;
  hashed_password: string;
  created_at: ColumnType<Date, never, never>;
  school: string | null;
  name: string | null;
  role: string;
  password_reset_token: string | null;
  password_reset_expires_at: Date | null;
  kompgen_token: string | null;
};

export const USER_PUBLIC_FIELDS = ["id", "email", "username", "name", "role"] as const;
export type User = Selectable<UserTable>;
export type UserPublic = Pick<User, (typeof USER_PUBLIC_FIELDS)[number]>;
