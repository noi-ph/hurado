import { NextRequest, NextResponse } from "next/server";

import { db } from "db";
import { SessionData } from "common/types";
import { tokenizeSession } from "server/sessions";
import { createUser } from "server/logic/users";
import { UniquenessConflictError } from "common/errors";
import { zUserRegister } from "common/validation/user_validation";

export async function POST(request: NextRequest) {
  const { email, username, password, confirmPassword } = await request.json();

  if (password !== confirmPassword) {
    return NextResponse.json({}, { status: 400 });
  }
  const parsed = zUserRegister.safeParse({
    email,
    username,
    password,
  });

  if (!parsed.success) {
    return NextResponse.json({}, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    try {
      const user = await createUser(trx, {
        email: parsed.data.email,
        username: parsed.data.username,
        password: parsed.data.password,
        role: 'user',
      });

      const session: SessionData = { user };
      return NextResponse.json(session, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenizeSession(session)}`,
        },
      });
    } catch (err) {
      if (err instanceof UniquenessConflictError) {
        return NextResponse.json({}, { status: 409 });
      }
      throw err;
    }
  });
}
