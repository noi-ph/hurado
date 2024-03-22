'use client'

import type { FunctionComponent } from 'react'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

import styles from './page.module.css'

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
            await fetch('api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                })
            })

            router.push('/dashboard')
        } catch (error) {}

        setThrottle(false)
    }

    return (
        <form id={ styles.loginform }>
            <h1>Login</h1>
            <div className={ styles.row }>
                <label htmlFor={ styles.username }>Username:</label>
                <input
                    type="text"
                    id={ styles.username }
                    onChange={ (e) => setUsername(e.target.value) } />
            </div>
            <div className={ styles.row }>
                <label htmlFor={ styles.password }>Password:</label>
                <input 
                    type="password"
                    id={ styles.password }
                    onChange={ (e) => setPassword(e.target.value) } />
            </div>
            <button
                type='button'
                id={ styles.submit }
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
