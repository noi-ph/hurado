import { NextResponse } from 'next/server'

export const middleware = () => {
    const headers = new Headers()

    headers.set('Content-Type', 'application/json')
    headers.set(
        'Access-Control-Allow-Origin',
        'https://hurado.ncisomendoza.com',
    )

    return NextResponse.next({
        request: { headers }
    })
}
