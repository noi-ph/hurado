'use client'

import type { FunctionComponent } from 'react'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import styles from './page.module.css'

import { https } from '@root/https'

const Page: FunctionComponent = () => {
    const [ throttle, setThrottle ] = useState<boolean>(false)

    useEffect(() => {
        const submit = document.getElementById(styles.submit)!

        submit.style.backgroundColor = throttle 
            ? 'var(--purple-light)' 
            : 'var(--purple)'
    }, [ throttle ])

    const router = useRouter()

    const [ username, setUsername ] = useState<string>('')
    const [ password, setPassword ] = useState<string>('')

    const login = async () => {
        try {
            await https.post('v1/auth/login', {
                username,
                password,
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
            <button type='button' id={ styles.submit } onClick={() => {
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
