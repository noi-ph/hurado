import { hashSync } from "bcryptjs";
import { UniquenessConflictError } from "common/errors";
import { Models, UserPublic  } from "common/types";
import { Transaction } from "kysely";

type CreateUserData = {
  email: string;
  username: string;
  password: string;
  role?: "admin" | "user";
};

export async function createUser(trx: Transaction<Models>, data: CreateUserData): Promise<UserPublic> {
  const existing = await trx
    .selectFrom("users")
    .select("id")
    .where((eb) => eb.or([
      eb("email", "=", data.email),
      eb("username", "=", data.username),
    ]))
    .executeTakeFirst();

  if (existing) {
    throw new UniquenessConflictError(existing);
  }

  const role = data.role ?? "user";
  const result = await trx
    .insertInto("users")
    .values({
      email: data.email,
      username: data.username,
      hashed_password: hashSync(data.password, 10),
      name: "",
      role: role,
    })
    .returning(["id"])
    .execute();

  return {
    id: result[0].id,
    email: data.email,
    username: data.username,
    role: role,
    name: "",
  } satisfies UserPublic;
}
