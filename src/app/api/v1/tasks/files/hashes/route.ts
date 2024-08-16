import { db } from "db";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "server/sessions";
import { z } from 'zod';

const schema = z.array(z.string());

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }
  const parsed = await schema.parse(request.body);
  const hash_objs = await db.selectFrom('files').select('hash').where('hash', 'in', parsed).execute();
  const hash_list = hash_objs.map(f => f.hash);

  return NextResponse.json({ saved: hash_list });
}
