import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { NextContext } from "types/nextjs";
import { db } from "db";
import { OverallVerdictDisplayDTO } from "common/types/verdicts";

type RouteParams = {
  id: string;
};

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  const session = await getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const contestId = searchParams.get("contest_id");

  const overall_verdict: OverallVerdictDisplayDTO | undefined = await db
    .selectFrom("overall_verdicts")
    .where("overall_verdicts.user_id", "=", session.user.id)
    .where("overall_verdicts.task_id", "=", context.params.id)
    .where("overall_verdicts.contest_id", contestId ? "=" : "is", contestId ? contestId : null)
    .select(["overall_verdicts.score_overall", "overall_verdicts.score_max"])
    .executeTakeFirst();

  return NextResponse.json({
    verdict:
      overall_verdict == undefined
        ? undefined
        : ({
            score_overall: overall_verdict.score_overall,
            score_max: overall_verdict.score_max,
          } satisfies OverallVerdictDisplayDTO),
  });
}
