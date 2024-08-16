import { NextRequest, NextResponse } from "next/server";
import { canManageTasks } from "server/authorization";
import { updateEditorTask } from "server/logic/tasks/update_editor_task";
import { zTaskSchema } from "server/logic/tasks/update_editor_task_validation";
import { getSession } from "server/sessions";

export async function PUT(request: NextRequest) {
  const session = getSession(request);
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 401 });
  }
  const data = await request.json();
  const parsed = zTaskSchema.safeParse(data);
  if (parsed.success) {
    updateEditorTask(parsed.data);
    return NextResponse.json({ message: 'good' });
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}
