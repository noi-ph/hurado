import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";

import { db } from "db";
import { SessionData, UserPublic } from "common/types";
import { tokenizeSession } from "server/sessions";

export async function POST(request: NextRequest) {
  const { email, username, password, confirmPassword } = await request.json();

  if (password !== confirmPassword) {
    return NextResponse.json({}, { status: 400 });
  }

  db.transaction().execute(async (trx) => {
    {
      const user = await trx
        .selectFrom("users")
        .select("id")
        .where("email", "=", email)
        .executeTakeFirst();

      if (user) {
        return NextResponse.json({}, { status: 409 });
      }
    }

    {
      const user = await trx
        .selectFrom("users")
        .select("id")
        .where("username", "=", username)
        .executeTakeFirst();

      if (user) {
        return NextResponse.json({}, { status: 409 });
      }
    }

    const result = await trx
      .insertInto("users")
      .values({
        email,
        username,
        hashed_password: hashSync(password, 10),
      })
      .execute();

    const user: UserPublic = {
      id: result[0].insertId as unknown as string,
      email,
      username,
      name: "Unknown User",
    };

    const session: SessionData = { user };
    return NextResponse.json(session, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenizeSession(session)}`,
      },
    });
  });
}
