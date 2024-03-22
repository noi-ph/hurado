'use client'

import type { User } from '@models'

import { useState, useEffect } from 'react'
import { cookies } from 'next/headers'

export const useAuth = () => {
    const [ user, setUser ] = useState<User | null>(null)
    const [ loggedin, setLoggedin ] = useState<boolean>(false)

    const storage = cookies()
    const token = storage.get('algurado/token')?.value

    useEffect(() => {
        (async () => {
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
                    setUser(data.user!)
                    setLoggedin(true)
                }
            } catch (error) {}
        })()
    }, [])

    return { user, setUser, loggedin, setLoggedin }
}
