import { Language, Verdict } from "common/types/constants";
import { SubmissionSummaryDTO } from "common/types/submissions";
import { db } from "db";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "server/sessions";

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }
  const { searchParams } = request.nextUrl;
  const taskId = searchParams.get("taskId");
  let query = db
    .selectFrom("submissions")
    .leftJoin("verdicts", "verdicts.id", "submissions.official_verdict_id")
    .select([
      "submissions.id",
      "submissions.language",
      "submissions.created_at",
      "submissions.official_verdict_id",
      "verdicts.verdict",
      "verdicts.raw_score",
      "verdicts.running_time_ms",
      "verdicts.running_memory_byte",
    ])
    .orderBy("submissions.created_at", "desc");
  if (taskId) {
    query.where("task_id", "=", taskId);
  }
  const dbResults = await query.execute();

  const submissions: SubmissionSummaryDTO[] = dbResults.map((sub) => ({
    id: sub.id,
    language: sub.language as Language,
    created_at: sub.created_at,
    verdict_id: sub.official_verdict_id,
    verdict: sub.verdict as Verdict | null,
    score: sub.raw_score,
    running_time_ms: sub.running_time_ms,
    running_memory_byte: sub.running_memory_byte,
  }));

  return NextResponse.json(submissions);
}
