import { NextRequest, NextResponse } from "next/server";
import { zProblemSetCreate } from "common/validation/problem_set_validation";
import { db } from "db";
import { getSession } from "server/sessions";
import { canManageProblemSets } from "server/authorization";
import {
  APIForbiddenError,
  APIForbiddenErrorType,
  APIValidationErrorType,
  APISuccessResponse,
  customValidationError,
  makeSuccessResponse,
  zodValidationError,
} from "common/responses";

export type ProblemSetCreateError =
  | APIForbiddenErrorType
  | APIValidationErrorType<typeof zProblemSetCreate>;

export type ProblemSetCreateSuccess = APISuccessResponse<{ id: string }>

export type ProblemSetCreateResponse =
  | ProblemSetCreateError
  | ProblemSetCreateSuccess;


export async function POST(request: NextRequest): Promise<NextResponse<ProblemSetCreateResponse>> {
  const session = await getSession(request);
  if (session == null || !canManageProblemSets(session)) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }

  const data = await request.json();
  const parsed = zProblemSetCreate.safeParse(data);

  if (!parsed.success) {
    const errors = zodValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    const current = await trx
      .selectFrom("problem_sets")
      .where("slug", "=", parsed.data.slug)
      .select("id")
      .execute();

    if (current.length > 0) {
      return NextResponse.json(customValidationError({
        slug: ["Slug already exists"],
      }), { status: 400 });
    }

    const dbProblemSet = await trx
      .insertInto("problem_sets")
      .values([
        {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: "",
          is_public: false,
          order: 0,
        },
      ])
      .returning(["id"])
      .executeTakeFirstOrThrow();

    return NextResponse.json(makeSuccessResponse({
      id: dbProblemSet.id,
    }));
  });
}
