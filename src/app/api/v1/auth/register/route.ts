import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";
import { db } from "db";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { SessionData, UserPublic } from "common/types";
import { tokenizeSession } from "server/sessions";
import { createUser } from "server/logic/users";
import { zUserRegister } from "common/validation/user_validation";
import { APISuccessResponse, APIValidationErrorType, customValidationError, makeSuccessResponse, zodValidationError } from "common/responses";


export type UserRegisterError = APIValidationErrorType<typeof zUserRegister>;

export type UserRegisterSuccess = APISuccessResponse<SessionData>

export type UserRegisterResponse =
  | UserRegisterError
  | UserRegisterSuccess;


type CustomValidationErrors = {
  email?: string[];
  username?: string[];
};

export async function POST(request: NextRequest): Promise<NextResponse<UserRegisterResponse>> {
  const { email, username, password, confirmPassword } = await request.json();

  const parsed = zUserRegister.safeParse({
    email,
    username,
    password,
    confirmPassword,
  });

  if (!parsed.success) {
    const errors = zodValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    // Check if the email or username already exists
    const current = await trx
      .selectFrom("users")
      .where((eb) => eb.or([
        eb("email", "=", parsed.data.email),
        eb("username", "=", parsed.data.username),
      ]))
      .select(["id", "email", "username"])
      .execute();

    const currentEmail = current.find((u) => u.email === parsed.data.email);
    const currentUsername = current.find((u) => u.username === parsed.data.username);
    if (currentEmail != null || currentUsername != null) {
      const errors: CustomValidationErrors = {};
      if (currentEmail != null) {
        errors.email = ["Email already exists"];
      }
      if (currentUsername != null) {
        errors.username = ["Username already exists"];
      }

      return NextResponse.json(customValidationError(errors), { status: 400 });
    }

    const raw = await createUser(trx, {
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
      role: 'user',
    });

    const session: SessionData = {
      user: {
        id: raw.id,
        email: raw.email,
        username: raw.username,
        name: raw.name,
        role: raw.role,
      },
    };
    cookies().set("session", tokenizeSession(session), { maxAge: 60 * 60 * 24 * 365 });

    return NextResponse.json(makeSuccessResponse(session));
  });
}
