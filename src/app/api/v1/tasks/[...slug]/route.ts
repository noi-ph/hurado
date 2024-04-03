import { NextResponse, NextRequest } from 'next/server';

import knex from 'db';

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const slug = url.pathname.split('/').pop();

  try {
    const task = await knex('tasks').where({ slug }).first();

    if (task) {
      return NextResponse.json(task, { status: 200 });
    }
  } catch (error) {}

  return NextResponse.json({}, { status: 404 });
}
