import { NextRequest, NextResponse } from "next/server";
import { compareSync } from "bcryptjs";

import { cookies } from "next/headers";
import { db } from "db";
import { tokenizeSession } from "server/sessions";
import { SessionData } from "common/types/auth";
import {
  APISuccessResponse,
  APIValidationErrorType,
  customValidationError,
  makeSuccessResponse,
  zodValidationError,
} from "common/responses";
import { zUserLogin } from "common/validation/user_validation";

export type UserLoginError = APIValidationErrorType<typeof zUserLogin>;

export type UserLoginSuccess = APISuccessResponse<SessionData>

export type UserLoginResponse =
  | UserLoginError
  | UserLoginSuccess;


export async function POST(request: NextRequest): Promise<NextResponse<UserLoginResponse>> {
  const { username, password } = await request.json();

  const parsed = zUserLogin.safeParse({
    username,
    password,
  });

  if (!parsed.success) {
    const errors = zodValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  const secret = await db
    .selectFrom("users")
    .select(["id", "email", "username", "name", "role", "hashed_password"])
    .where("username", "=", username)
    .executeTakeFirst();

  if (!secret || !compareSync(password, secret.hashed_password)) {
    return NextResponse.json(customValidationError({
      password: ['Invalid username or password']
    }), { status: 401 });
  }

  const session: SessionData = {
    user: {
      id: secret.id,
      email: secret.email,
      username: secret.username,
      name: secret.name,
      role: secret.role,
    },
  };

  cookies().set("session", tokenizeSession(session), { maxAge: 60 * 60 * 24 * 365 });
  return NextResponse.json(makeSuccessResponse(session));
}
