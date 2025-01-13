import { NextRequest, NextResponse } from "next/server";
import { zTask } from "common/validation/task_validation";
import { db } from "db";
import { updateEditorTask } from "server/logic/tasks/update_editor_task";
import { getSession } from "server/sessions";
import { canManageTasks } from "server/authorization";

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (session == null || !canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 401 });
  }

  const data = await request.json();
  const parsed = zTask.safeParse(data);
  if (parsed.success) {
    const task = parsed.data;
    const dbTasks = await db
      .insertInto("tasks")
      .values([
        {
          title: task.title,
          slug: task.slug,
          statement: task.statement,
          is_public: task.is_public,
          type: task.type,
          score_max: task.score_max,
          checker_kind: task.checker_kind,
          owner_id: session.user.id,
        },
      ])
      .returning(["id"])
      .execute();

    task.id = dbTasks[0].id; // overwrite the dummy value
    await updateEditorTask(task);
    return NextResponse.json(task);

  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}
