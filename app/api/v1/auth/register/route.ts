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
        const user = await knex('users')
            .where({ email })
            .first()
            .then((user: any) => user) // TODO: use knex interface builder
        
        if (user) {
            return NextResponse.json({}, { status: 500 })
        }
    } catch (error) {}

    try {
        const user = await knex('users')
            .where({ username })
            .first()
            .then((user: any) => user) // TODO: use knex interface builder
        
        if (user) {
            return NextResponse.json({}, { status: 500 })
        }
    } catch (error) {}

    if (password !== confirmPassword) {
        return NextResponse.json({}, { status: 500 })
    }

    await knex('users').insert({
        email,
        username,
        hashed_password: hashSync(password, 10),
    })

    return NextResponse.json({}, { status: 200 })
}