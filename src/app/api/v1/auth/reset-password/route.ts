import { NextRequest, NextResponse } from "next/server";

import { db } from "db";
import { zUserResetPasswordServer } from "common/validation/user_validation";
import {
  APISuccessResponse,
  APIValidationErrorType,
  customValidationError,
  makeSuccessResponse,
  zodValidationError,
} from "common/responses";
import { hashPassword } from "server/logic/users";

export type ResetPasswordError = APIValidationErrorType<typeof zUserResetPasswordServer>;

export type ResetPasswordSuccess = APISuccessResponse<null>;

export type ResetPasswordResponse = ResetPasswordError | ResetPasswordSuccess;

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  const parsed = zUserResetPasswordServer.safeParse({
    token: token,
    password: password,
  });

  if (!parsed.success) {
    const errors = zodValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom("users")
      .where("password_reset_token", "=", parsed.data.token)
      .where("password_reset_expires_at", ">", new Date())
      .select(["id"])
      .executeTakeFirst();

    if (user == null) {
      return NextResponse.json(
        customValidationError({
          token: ["Invalid token"],
        }),
        { status: 400 }
      );
    }

    await trx
      .updateTable("users")
      .where("id", "=", user.id)
      .set({
        password_reset_token: null,
        password_reset_expires_at: null,
        hashed_password: hashPassword(parsed.data.password),
      })
      .execute();

    return NextResponse.json(makeSuccessResponse(null));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
function censorEmail(email: string): string {
  const [username, domain] = email.split("@");
  // Show only the first two characters of the username
  const censoredUsername = `${username.slice(0, 2)}***`;
  // Split the domain name by '.'
  const [domainName, domainExtension] = domain.split(".");
  // Show only the first and last character of the domain name
  const censoredDomainName = `${domainName.slice(0, 1)}***${domainName.slice(-1)}`;
  // Return the censored email
  return `${censoredUsername}@${censoredDomainName}.${domainExtension}`;
}
