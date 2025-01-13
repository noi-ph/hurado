import { NextRequest, NextResponse } from "next/server";
import { zContestCreate } from "common/validation/contest_validation";
import { db } from "db";
import { getSession } from "server/sessions";
import { canManageContests } from "server/authorization";
import {
  APIForbiddenError,
  APIForbiddenErrorType,
  APIValidationErrorType,
  APISuccessResponse,
  customValidationError,
  makeSuccessResponse,
  zodValidationError,
} from "common/responses";

export type ContestCreateError =
  | APIForbiddenErrorType
  | APIValidationErrorType<typeof zContestCreate>;

export type ContestCreateSuccess = APISuccessResponse<{ id: string }>

export type ContestCreateResponse =
  | ContestCreateError
  | ContestCreateSuccess;


export async function POST(request: NextRequest): Promise<NextResponse<ContestCreateResponse>> {
  const session = await getSession(request);
  if (session == null || !canManageContests(session)) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }

  const data = await request.json();
  const parsed = zContestCreate.safeParse(data);

  if (!parsed.success) {
    const errors = zodValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    const current = await trx
      .selectFrom("contests")
      .where("slug", "=", parsed.data.slug)
      .select("id")
      .execute();

    if (current.length > 0) {
      return NextResponse.json(customValidationError({
        slug: ["Slug already exists"],
      }), { status: 400 });
    }

    const dbContest = await trx
      .insertInto("contests")
      .values([
        {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: "",
          statement: "",
          is_public: false,
          owner_id: session.user.id,
        },
      ])
      .returning(["id"])
      .executeTakeFirstOrThrow();

    return NextResponse.json(makeSuccessResponse({
      id: dbContest.id,
    }));
  });
}
