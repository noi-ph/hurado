import { NextRequest, NextResponse } from "next/server";
import { getSession } from "server/sessions";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }
  return NextResponse.json({ message: "nothing yet" });
}
