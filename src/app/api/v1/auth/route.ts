import { NextRequest, NextResponse } from "next/server";
import { getSession, tokenizeSession } from "server/sessions";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }

  return NextResponse.json(session, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenizeSession(session)}`,
    },
  });
}
