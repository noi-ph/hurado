import type { User } from '@models'

import { NextRequest, NextResponse } from 'next/server'
import { hashSync } from 'bcryptjs'

import knex from '@knex'

export async function POST (request: NextRequest) {
    const {
        email,
        username,
        password,
        confirmPassword,
    } = await request.json()

    try {
        const user: User = await knex('users').where({ email }).first()
        
        if (user) {
            return NextResponse.json({}, { status: 409 })
        }
    } catch (error) {}

    try {
        const user: User = await knex('users').where({ username }).first()
        
        if (user) {
            return NextResponse.json({}, { status: 409 })
        }
    } catch (error) {}

    if (password !== confirmPassword) {
        return NextResponse.json({}, { status: 400 })
    }

    await knex('users').insert({
        email,
        username,
        hashed_password: hashSync(password, 10),
    })

    return NextResponse.json({}, { status: 200 })
}
