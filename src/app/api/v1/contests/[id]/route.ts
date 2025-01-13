import { NextRequest, NextResponse } from "next/server";
import { zContest } from "common/validation/contest_validation";
import { canManageContests } from "server/authorization";
import { getSession } from "server/sessions";
import { updateContest } from "server/logic/contests/update_contest";

export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!canManageContests(session)) {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await request.json();
  const parsed = zContest.safeParse(data);
  if (parsed.success) {
    const contest = await updateContest(parsed.data);
    return NextResponse.json(contest);
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}
