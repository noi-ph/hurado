import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";

import { db } from "db";

import { User } from "db/types";
import { tokenize } from "../route";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const user: User | undefined = await db
    .selectFrom("users")
    .selectAll()
    .where("username", "=", username)
    .executeTakeFirst();

  if (user && compareSync(password, user.hashed_password)) {
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
