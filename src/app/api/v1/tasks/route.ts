import { NextRequest, NextResponse } from "next/server";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!canManageTasks(session)) {
    return NextResponse.json({}, { status: 401 });
  }

  const data = await request.json();
  console.log(data);
  return NextResponse.json({ message: "this is supposed to make a new task" });
}
