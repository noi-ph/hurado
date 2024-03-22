import type { User } from '@models'

import jwt from 'jsonwebtoken'

import { NextRequest, NextResponse } from 'next/server'

type payload = {
    user: User
}

export const tokenize = (load: payload) => {
    return jwt.sign(load, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRE!,
    })
}

export async function GET (request: NextRequest) {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
        return NextResponse.json({}, { status: 401 })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as payload

        return NextResponse.json({ user: decoded.user }, { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenize(decoded)}`
            },
        })
    } catch (error) {}

    return NextResponse.json({}, { status: 401 })
}
