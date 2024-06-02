import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";

import { db } from "db";
import { User } from "db/types";

export async function POST(request: NextRequest) {
  const { email, username, password, confirmPassword } = await request.json();

  if (password !== confirmPassword) {
    return NextResponse.json({}, { status: 400 });
  }

  db.transaction().execute(async (trx) => {
    {
      const user: User | undefined = await trx
        .selectFrom("users")
        .selectAll()
        .where("email", "=", email)
        .executeTakeFirst();

      if (user) {
        return NextResponse.json({}, { status: 409 });
      }
    }

    {
      const user: User | undefined = await trx
        .selectFrom("users")
        .selectAll()
        .where("username", "=", username)
        .executeTakeFirstOrThrow();

      if (user) {
        return NextResponse.json({}, { status: 409 });
      }
    }

    await trx
      .insertInto("users")
      .values({
        email,
        username,
        hashed_password: hashSync(password, 10),
      })
      .execute();

    return NextResponse.json({}, { status: 200 });
  });
}
