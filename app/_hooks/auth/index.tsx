'use client'

import type { User } from '@models'

import { useState, useEffect, useCallback } from 'react'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'

const useToken = () => {
    const data = getCookie('algurado/token')
    const [ token, setToken ] = useState<string | null>(data ?? null)

    useEffect(() => {
        if (token === null) {
            return deleteCookie('algurado/token')
        }

        setCookie('algurado/token', token)
    }, [ token ])

    return { token, setToken }
}

const useUser = () => {
    const data = getCookie('algurado/user')
    const [ user, setUser ] = useState<User | null>(
        data ? JSON.parse(data) : null
    )

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

const useValidate = useCallback(async () => {
    await validate()
}, [ validate ])

export const useAuth = () => {
    const { user } = useUser()
    const { token, setToken } = useToken()
    const [ shouldCheck, setShouldCheck ] = useState<boolean>(false)

    useEffect(() => {
        useValidate()
    }, [ token ])

    useEffect(() => {
        if (shouldCheck) {
            useValidate()
            setShouldCheck(false)
        }
    }, [ shouldCheck ])

    return {
        user,
        token,
        setToken,
        checkAuth: () => setShouldCheck(true),
    }
}
