import { NextRequest, NextResponse } from "next/server";
import { db } from "db";
import { APIForbiddenError } from "common/responses";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { enqueueSubmissionJudgement } from "worker/queue";
import { NextContext } from "types/nextjs";
import { upsertOverallVerdict } from "server/logic/judgements/judge_runner";
import { loadTask } from "server/logic/submissions/judge_submission";

type RouteParams = {
  id: string;
};

export async function PUT(request: NextRequest, context: NextContext<RouteParams>) {
  const session = await getSession(request);
  if (session == null) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 403 });
  }

  await db.transaction().execute(async (trx) => {
    const sub = await trx
      .selectFrom("submissions")
      .where("submissions.id", "=", context.params.id)
      .select(["task_id", "official_verdict_id", "user_id", "contest_id"])
      .executeTakeFirstOrThrow();
    const tsk = await loadTask(trx, sub.task_id);

    await trx
      .updateTable("submissions")
      .where("submissions.id", "=", context.params.id)
      .set({
        official_verdict_id: null,
      })
      .execute();

    await trx
      .updateTable("verdicts")
      .set({
        is_official: false,
      })
      .where("verdicts.id", "=", sub.official_verdict_id)
      .execute();

    await upsertOverallVerdict(tsk, sub.user_id, sub.contest_id, trx);
  });
  await enqueueSubmissionJudgement({ id: context.params.id });

  return NextResponse.json(null);
}
