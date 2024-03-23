'use client'

import type { User } from '@models'

import { useState, useEffect } from 'react'
import { getCookie, setCookie, deleteCookie, hasCookie } from 'cookies-next'

const useToken = () => {
    const data = hasCookie('algurado/token')
        ? getCookie('algurado/token')!
        : null

    const [ token, setToken ] = useState<string | null>(data)

    useEffect(() => {
        if (token === null) {
            return deleteCookie('algurado/token')
        }

        setCookie('algurado/token', token)
    }, [ token ])

    return { token, setToken }
}

const useUser = () => {
    const data = hasCookie('algurado/user') 
        ? JSON.parse(getCookie('algurado/user')!)
        : null

    const [ user, setUser ] = useState<User | null>(data)

    useEffect(() => {
        if (user === null) {
            return deleteCookie('algurado/user')
        }

        setCookie('algurado/user', user)
    }, [ user ])

    return { user, setUser }
}

const validate = async () => {
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

export const useAuth = () => {
    const { user } = useUser()
    const { token, setToken } = useToken()

    useEffect(() => {
        validate()
    }, [ token ])

    return {
        user,
        validate,
        setToken,
    }
}
