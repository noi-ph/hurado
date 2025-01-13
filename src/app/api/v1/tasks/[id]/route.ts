import { NextRequest, NextResponse } from "next/server";
import { zTask } from "common/validation/task_validation";
import { canManageTasks } from "server/authorization";
import { updateEditorTask } from "server/logic/tasks/update_editor_task";
import { getSession } from "server/sessions";
import { NextContext } from "types/nextjs";
import { TaskLookupDTO } from "common/types";
import { lookupFromSlugOrId } from "./utils";

type RouteParams = {
  id: string;
};

export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await request.json();
  const parsed = zTask.safeParse(data);
  if (parsed.success) {
    const task = await updateEditorTask(parsed.data);
    return NextResponse.json(task);
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  const session = await getSession(request);
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 403 });
  }

  // Accept any of slug, uuid, or hurado id
  const slug = context.params.id;
  const first = await lookupFromSlugOrId(slug);
  if (first == null) {
    return NextResponse.json(null, { status: 404 });
  }

  const dto: TaskLookupDTO = {
    id: first.id,
    slug: first.slug,
    title: first.title,
  };
  return NextResponse.json(dto);
}
