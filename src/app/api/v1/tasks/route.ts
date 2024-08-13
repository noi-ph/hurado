import { NextRequest, NextResponse } from "next/server";
import { getSession } from "server/sessions";

export async function PUT(request: NextRequest) {
  const session = getSession(request);
  if (session == null || session.user.role != 'admin') {
    return NextResponse.json({}, { status: 401 });
  }

  const data = await request.json();
  console.log(data);
  return NextResponse.json({ message: "nothing yet" });
}
