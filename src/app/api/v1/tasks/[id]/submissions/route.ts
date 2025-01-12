import { Language, Verdict } from "common/types/constants";
import { SubmissionSummaryDTO } from "common/types/submissions";
import { db } from "db";
import { NextRequest, NextResponse } from "next/server";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { NextContext } from "types/nextjs";

type RouteParams = {
  id: string;
};

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  const session = getSession(request);
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 401 });
  }

  const taskId = context.params.id;

  const dbResults = await db
    .selectFrom("submissions")
    .where("task_id", "=", taskId)
    .leftJoin("verdicts", "verdicts.id", "submissions.official_verdict_id")
    .leftJoin("users", "users.id", "submissions.user_id")
    .select([
      "submissions.id",
      "submissions.language",
      "submissions.created_at",
      "submissions.official_verdict_id",
      "verdicts.verdict",
      "verdicts.score_raw",
      "verdicts.running_time_ms",
      "verdicts.running_memory_byte",
      "users.username",
    ])
    .orderBy("submissions.created_at", "desc")
    .execute();

  const submissions: SubmissionSummaryDTO[] = dbResults.map((sub) => ({
    id: sub.id,
    language: sub.language as Language,
    username: sub.username,
    created_at: sub.created_at,
    verdict_id: sub.official_verdict_id,
    verdict: sub.verdict as Verdict | null,
    score: sub.score_raw,
    running_time_ms: sub.running_time_ms,
    running_memory_byte: sub.running_memory_byte,
  }));

  return NextResponse.json(submissions);
}
