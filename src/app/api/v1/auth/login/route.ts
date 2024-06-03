import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";

import { db } from "db";

import { UserPublic } from "db/types";
import { tokenize } from "../route";

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
    return NextResponse.json(
      { user },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenize({ user })}`,
        },
      }
    );
  }

  return NextResponse.json({}, { status: 401 });
}
