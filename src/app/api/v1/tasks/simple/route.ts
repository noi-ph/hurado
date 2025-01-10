import { NextRequest, NextResponse } from "next/server";
import { zTaskCreateSimple } from "common/validation/task_validation";
import { db } from "db";
import { getSession } from "server/sessions";
import { canManageTasks } from "server/authorization";
import { CheckerKind, TaskType } from "common/types/constants";
import {
  APIForbiddenError,
  APIForbiddenErrorType,
  APIValidationErrorType,
  makeValidationError,
  makeSuccessResponse,
  APISuccessResponse,
  customValidationError,
} from "common/responses";
import { z } from "zod";

export type TaskCreateSimpleError =
  | APIForbiddenErrorType
  | APIValidationErrorType<typeof zTaskCreateSimple>;

export type TaskCreateSimplePayload = {
  id: string;
};

export type TaskCreateSimpleResponse =
  | TaskCreateSimpleError
  | APISuccessResponse<TaskCreateSimplePayload>;


export async function POST(request: NextRequest): Promise<NextResponse<TaskCreateSimpleResponse>> {
  const session = getSession(request);
  if (session == null || !canManageTasks(session, request)) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }

  const data = await request.json();
  const parsed = zTaskCreateSimple.safeParse(data);

  if (!parsed.success) {
    const errors = makeValidationError(parsed.error);
    return NextResponse.json(errors, { status: 400 });
  }

  return db.transaction().execute(async (trx) => {
    const current = await trx
      .selectFrom("tasks")
      .where("slug", "=", parsed.data.slug)
      .select("id")
      .execute();

    if (current.length > 0) {
      return NextResponse.json(customValidationError({
        slug: ["Slug already exists"],
      }), { status: 400 });
    }

    const dbTask = await trx
      .insertInto("tasks")
      .values([
        {
          title: parsed.data.title,
          slug: parsed.data.slug,
          statement: '',
          is_public: false,
          type: TaskType.Batch,
          score_max: 0,
          checker_kind: CheckerKind.LenientDiff,
          owner_id: session.user.id,
        },
      ])
      .returning(["id"])
      .executeTakeFirstOrThrow();

    return NextResponse.json(makeSuccessResponse({
      id: dbTask.id,
    }));
  });
}
