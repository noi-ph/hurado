import { NextRequest, NextResponse } from "next/server";
import { zProblemSet } from "common/validation/problem_set_validation";
import { canManageProblemSets } from "server/authorization";
import { getSession } from "server/sessions";
import { updateProblemSet } from "server/logic/problem_sets/update_problem_set";
import { NextContext } from "types/nextjs";
import { NestedLookupDTO } from "common/types";
import { lookupSetFromSlugOrId } from "./utils";

type RouteParams = {
  id: string;
};

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

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  const session = await getSession(request);
  if (!canManageProblemSets(session)) {
    return NextResponse.json({}, { status: 403 });
  }

  // Accept any of slug, uuid, or hurado id
  const slug = context.params.id;
  const first = await lookupSetFromSlugOrId(slug);
  if (first == null) {
    return NextResponse.json(null, { status: 404 });
  }

  const dto: NestedLookupDTO = {
    id: first.id,
    slug: first.slug,
    title: first.title,
  };
  return NextResponse.json(dto);
}
