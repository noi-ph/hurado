'use client'

import type { FunctionComponent } from 'react'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

import styles from './page.module.css'

const labelnames = {
    username: 'Username',
    password: 'Password',
}

const Page: FunctionComponent = () => {
    const [ throttle, setThrottle ] = useState<boolean>(false)

    const submit = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        submit.current!.style.backgroundColor = throttle 
            ? 'var(--purple-light)' 
            : 'var(--purple)'
    }, [ throttle ])

    const router = useRouter()

    const [ username, setUsername ] = useState<string>('')
    const [ password, setPassword ] = useState<string>('')

    const login = async () => {
        try {
            const response = await fetch('api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                })
            })

            if (!response.ok) {
                throw new Error('')
            }

            router.push('/dashboard')
        } catch (error) {}

        setThrottle(false)
    }

    return (
        <form id={ styles.loginform }>
            <h1>Login</h1>
            <div className={ styles.row }>
                <label htmlFor={ labelnames.username }>Username:</label>
                <input
                    type="text"
                    id={ labelnames.username }
                    name={ labelnames.username }
                    onChange={ (e) => setUsername(e.target.value) } />
            </div>
            <div className={ styles.row }>
                <label htmlFor={ labelnames.password }>Password:</label>
                <input 
                    type="password"
                    id={ labelnames.password }
                    name={ labelnames.password }
                    onChange={ (e) => setPassword(e.target.value) } />
            </div>
            <button
                type='button'
                ref={ submit }
                onClick={() => {
                    if (throttle) {
                        return
                    }

                    login()
                    setThrottle(true)
            }}>Submit</button>
        </form>
    )
}

export default Page
