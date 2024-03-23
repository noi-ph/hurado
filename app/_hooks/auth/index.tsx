'use client'

import type { User } from '@models'

import { useState, useEffect, use } from 'react'
import { getCookie, setCookie, deleteCookie, hasCookie } from 'cookies-next'

export const useToken = () => {
    const [ token, setToken ] = useState<string | null>(
        hasCookie('algurado/token') ? getCookie('algurado/token')! : null
    )

    useEffect(() => {
        if (token === null) {
            return deleteCookie('algurado/token')
        }

        setCookie('algurado/token', token)
    }, [ token ])

    return { token, setToken }
}

export const useUser = () => {
    const [ user, setUser ] = useState<User | null>(
        hasCookie('algurado/user') 
        ? JSON.parse(getCookie('algurado/user')!)
        : null
    )

    useEffect(() => {
        if (user === null) {
            return deleteCookie('algurado/user')
        }

        setCookie('algurado/user', user)
    }, [ user ])

    return { user, setUser }
}

export const useValidate = async () => {
    const { setUser } = useUser()
    const { token, setToken } = useToken()

    try {
        const response = await fetch('api/v1/auth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (response.ok) {
            const data = await response.json()

            setUser(data.user as User)
            setToken(
                response.headers.get('Authorization')?.split(' ')[1] ?? null
            )

            return
        }
    } catch (error) {}

    setUser(null)
    setToken(null)

    return
}
