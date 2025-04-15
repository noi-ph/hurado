import { hashSync } from "bcryptjs";
import { Transaction } from "kysely";
import { UniquenessConflictError } from "common/errors";
import { Models, UserPublic } from "common/types";
import { db } from "db";
import { EmailSender } from "server/email";
import { getPath, Path } from "client/paths";
import { WEB_ACCESSIBLE_ORIGIN } from "server/secrets";

type CreateUserData = {
  email: string;
  username: string;
  password: string;
  role?: "admin" | "user";
};

type UpdateUserData = {
  name: string;
  school: string;
};

export async function createUser(
  trx: Transaction<Models>,
  data: CreateUserData
): Promise<UserPublic> {
  const existing = await trx
    .selectFrom("users")
    .select("id")
    .where((eb) => eb.or([eb("email", "=", data.email), eb("username", "=", data.username)]))
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
      hashed_password: hashPassword(data.password),
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

export async function resetPassword(username: string): Promise<unknown> {
  return await db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom("users")
      .where("username", "=", username)
      .select(["id", "email"])
      .executeTakeFirst();

    if (user == null) {
      throw new Error("User not found");
    }

    const token = generatePasswordResetToken();
    const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await trx
      .updateTable("users")
      .where("id", "=", user.id)
      .set({
        password_reset_token: token,
        password_reset_expires_at: expiry,
      })
      .execute();

    const path = getPath({ kind: Path.AccountPasswordReset, token });
    const url = `${WEB_ACCESSIBLE_ORIGIN}${path}`;

    await EmailSender.send(
      user.email,
      "no-reply@noi.ph",
      "Password Reset",
      `Your password reset link is ${url}`
    );

    return user;
  });
}

function generatePasswordResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export async function updateUser(id: string, data: UpdateUserData) {
  return await db.transaction().execute(async (trx) => {
    const user = await trx
      .updateTable("users")
      .where("id", "=", id)
      .set({
        name: data.name == "" ? null : data.name,
        school: data.school == "" ? null : data.school,
      })
      .executeTakeFirst();

    return user;
  });
}
