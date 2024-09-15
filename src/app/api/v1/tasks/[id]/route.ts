import { NextRequest, NextResponse } from "next/server";
import { zTaskSchema } from "common/validation/task_validation";
import { canManageTasks } from "server/authorization";
import { updateEditorTask } from "server/logic/tasks/update_editor_task";
import { getSession } from "server/sessions";
import { NextContext } from "types/nextjs";
import { checkUUIDv4, huradoIDToUUID } from "common/utils/uuid";
import { db } from "db";
import { TaskLookupDTO } from "common/types";

type RouteParams = {
  id: string;
};

export async function PUT(request: NextRequest) {
  const session = getSession(request);
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await request.json();
  const parsed = zTaskSchema.safeParse(data);
  if (parsed.success) {
    const task = await updateEditorTask(parsed.data);
    return NextResponse.json(task);
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}

export async function GET(request: NextRequest, context: NextContext<RouteParams>) {
  const session = getSession(request);
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 404 });
  }

  // Accept any of slug, uuid, or hurado id
  const slug = context.params.id;
  const uuid = huradoIDToUUID(slug) ?? checkUUIDv4(slug);

  const lookups = await db
    .selectFrom("tasks")
    .where((eb) => {
      if (uuid != null) {
        return eb.or([eb("id", "=", uuid), eb("slug", "=", slug)]);
      } else {
        return eb("slug", "=", slug);
      }
    })
    .select(["id", "slug", "title"])
    .execute();


  if (lookups.length == 0) {
    return NextResponse.json(null, { status: 404 });
  }

  // Sort the results. Matching UUID trumps matching slug. Best result goes to lowest index.
  lookups.sort((a, b) => {
    if (a.id === uuid) {
      return b.id === uuid ? 0 : -1;
    }
    return b.id === uuid ? 1 : 0;
  });

  const first = lookups[0];
  const dto: TaskLookupDTO = {
    id: first.id,
    slug: first.slug,
    title: first.title,
  };

  return NextResponse.json(dto);
}
