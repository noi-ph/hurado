import { NextRequest, NextResponse } from "next/server";

import { db } from "db";
import { zUserForgotPassword } from "common/validation/user_validation";
import {
  APISuccessResponse,
  APIValidationErrorType,
  customValidationError,
  makeSuccessResponse,
  zodValidationError,
} from "common/responses";
import { enqueuePasswordReset } from "worker/queue";

export type ForgotPasswordError = APIValidationErrorType<typeof zUserForgotPassword>;

export type ForgotPasswordSuccess = APISuccessResponse<{ email: string }>;

export type ForgotPasswordResponse = ForgotPasswordError | ForgotPasswordSuccess;

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  const parsed = zUserForgotPassword.safeParse({ username });

  if (!parsed.success) {
    const errors = zodValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom("users")
      .where("username", "=", parsed.data.username)
      .select(["id", "email"])
      .executeTakeFirst();

    if (user == null) {
      return NextResponse.json(
        customValidationError({
          username: ["User not found"],
        }),
        { status: 400 }
      );
    }

    await enqueuePasswordReset({
      username: parsed.data.username,
    });

    return NextResponse.json(
      makeSuccessResponse({
        email: censorEmail(user.email),
      })
    );
  });
}

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
