import { NextRequest, NextResponse } from "next/server";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { NextContext } from "types/nextjs";
import { db } from "db";
import { checkUUIDv4, huradoIDToUUID } from "common/utils/uuid";
import { OverallVerdictDisplayDTO } from "common/types/verdicts";

type RouteParams = {
  id: string;
};

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  const session = getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }

  // copy-pasted from lookupFromSlugOrId so I can do SQL stuffs
  const slug = context.params.id;
  const uuid = huradoIDToUUID(slug) ?? checkUUIDv4(slug);
  const overall_verdict: OverallVerdictDisplayDTO | undefined = await db
    .selectFrom("overall_verdicts")
    .where("overall_verdicts.user_id", "=", session.user.id)
    .innerJoin("tasks", "tasks.id", "overall_verdicts.task_id")
    .where((eb) => {
      if (uuid != null) {
        return eb.or([eb("tasks.id", "=", uuid), eb("tasks.slug", "=", slug)]);
      } else {
        return eb("tasks.slug", "=", slug);
      }
    })
    .select(["overall_verdicts.score_overall", "overall_verdicts.score_max"])
    .executeTakeFirst();
  
  return NextResponse.json({
    verdict: (overall_verdict == undefined ? undefined : {
      score_overall: overall_verdict.score_overall,
      score_max: overall_verdict.score_max,
    } satisfies OverallVerdictDisplayDTO),
  });
}
