import { db } from "db";
import { NextRequest, NextResponse } from "next/server";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { z } from "zod";

const schema = z.array(z.string());

export async function POST(request: NextRequest) {
  // This function accepts an array of hashes (string[]) and finds all hashes
  // in that list that are already in the database, so you can skip re-uploading them.
  const session = await getSession(request);
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 401 });
  }

  const parsed = await schema.parse(await request.json());
  let hashes: string[];
  if (parsed.length > 0) {
    const rows = await db.selectFrom("files").select("hash").where("hash", "in", parsed).execute();
    hashes = rows.map((f) => f.hash);
  } else {
    hashes = [];
  }
  return NextResponse.json({ saved: hashes });
}
