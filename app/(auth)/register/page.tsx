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

    const [ email, setEmail ] = useState<string>('')
    const [ username, setUsername ] = useState<string>('')
    const [ password, setPassword ] = useState<string>('')
    const [ confirmPassword, setConfirmPassword ] = useState<string>('')

    const register = async () => {
        try {
            const response = await fetch('api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    confirmPassword,
                })
            })

            if (!response.ok) {
                throw new Error('')
            }

            router.push('/login')
        } catch (error) {}

        setThrottle(false)
    }

    return (
        <form id={ styles.registerform }>
            <h1>Register</h1>
            <div className={ styles.row }>
                <label>Email:</label>
                <input
                    type='email'
                    onChange={ (e) => setEmail(e.target.value) } />
            </div>
            <div className={ styles.row }>
                <label>Username:</label>
                <input
                    type='text'
                    onChange={ (e) => setUsername(e.target.value) } />
            </div>
            <div className={ styles.row }>
                <label>Password:</label>
                <input
                    type='password'
                    onChange={ (e) => setPassword(e.target.value) } />
            </div>
            <div className={ styles.row }>
                <label>Confirm Password:</label>
                <input
                    type='password'
                    onChange={ (e) => setConfirmPassword(e.target.value) } />
            </div>
            <button
                type='button'
                ref={ submit }
                onClick={() => {
                    if (throttle) {
                        return
                    }

                    register()
                    setThrottle(true)
            }}>Submit</button>
        </form>
    )
}

export default Page
