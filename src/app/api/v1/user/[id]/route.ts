import { NextRequest, NextResponse } from "next/server";
import { zUserEdit } from "common/validation/user_validation";
import { canManageUser } from "server/authorization";
import { updateUser } from "server/logic/users";
import { getSession } from "server/sessions";
import { NextContext } from "types/nextjs";

type RouteParams = {
  id: string;
};

export async function PUT(request: NextRequest, context: NextContext<RouteParams>) {
  const session = await getSession(request);
  if (!canManageUser(session, context.params.id)) {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await request.json();
  const parsed = zUserEdit.safeParse(data);
  if (parsed.success) {
    const result = await updateUser(context.params.id, parsed.data);
    if (result.numUpdatedRows) {
      return NextResponse.json({}, { status: 200 });
    } else {
      return NextResponse.json({}, { status: 404 });
    }
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}
