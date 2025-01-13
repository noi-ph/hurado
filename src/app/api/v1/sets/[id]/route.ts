import { NextRequest, NextResponse } from "next/server";
import { zProblemSet } from "common/validation/problem_set_validation";
import { canManageProblemSets } from "server/authorization";
import { getSession } from "server/sessions";
import { updateProblemSet } from "server/logic/problem_sets/update_problem_set";


export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!canManageProblemSets(session)) {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await request.json();
  const parsed = zProblemSet.safeParse(data);
  if (parsed.success) {
    const contest = await updateProblemSet(parsed.data);
    return NextResponse.json(contest);
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}
