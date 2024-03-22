import type { User } from '@models'

import { NextRequest, NextResponse } from 'next/server'
import { compareSync } from 'bcryptjs'

import knex from '@knex'

export async function POST (request: NextRequest) {
    const {
        username,
        password,
    } = await request.json()

    try {
        const user: User = await knex('users').where({ username }).first()

        if (user && compareSync(password, user.hashed_password)) {
            return NextResponse.json({}, { status: 200 })
        }
    } catch (error) {}

    return NextResponse.json({}, { status: 401 })
}
