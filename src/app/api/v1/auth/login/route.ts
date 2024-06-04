import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";

import { cookies } from "next/headers";
import { db } from "db";
import { UserPublic } from "common/types";
import { tokenizeSession } from "server/sessions";
import { SessionData } from "common/types/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const secret = await db
    .selectFrom("users")
    .select(["id", "email", "username", "name", "hashed_password"])
    .where("username", "=", username)
    .executeTakeFirst();

  if (secret && compareSync(password, secret.hashed_password)) {
    const user: UserPublic = {
      id: secret.id,
      email: secret.email,
      username: secret.username,
      name: secret.name,
    };
    const session: SessionData = { user };
    cookies().set("session", tokenizeSession(session));
    return NextResponse.json(session);
  }

  return NextResponse.json({}, { status: 401 });
}
