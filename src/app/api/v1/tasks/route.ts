import type { Task } from 'lib/models'

import { NextResponse } from 'next/server'

import knex from 'db'

export async function GET () {
    try {
        const tasks: Task[] = await knex('tasks').select()

        return NextResponse.json(tasks, { status: 200 })
    } catch (error) {}

    return NextResponse.json({}, { status: 500 })
}
