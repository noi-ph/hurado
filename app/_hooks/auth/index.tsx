'use client'

import type { User } from '@models'

import { useState, useEffect, useCallback } from 'react'
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

    return useCallback(async () => {
        let newUser: User | null = null
        let newToken: string | null = null

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

                newUser = data.user as User
                newToken = response.headers
                    .get('Authorization')
                    ?.split(' ')[1]
                    ?? null
            }
        } catch (error) {}

        setUser(newUser)
        setToken(newToken)
    }, [ setUser, setToken ])
}
