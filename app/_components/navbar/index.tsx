'use client'

import type { FunctionComponent, ReactNode } from 'react'

import Link from 'next/link'

import { Fragment, useEffect, useState } from 'react'

import styles from './index.module.css'

import { Member } from './member'
import { Guest } from './guest'
import { useUser } from '@hooks'

export const Navbar: FunctionComponent = () => {
    const { user } = useUser()
    const [ links, setLinks ] = useState<ReactNode>(null)

    useEffect(() => {
        setLinks(
            user ? <Member /> : <Guest />
        )
    }, [ user ])

    return (
        <Fragment>
            <div className={ styles.row }>
                <Link href='/'>Home</Link>
                <Link
                    href='/tasks'
                    className={ styles.desktoplinks }
                >Tasks</Link>
                { links }
            </div>
            <Link href='/sitemap'>Sitemap</Link>
        </Fragment>
    )
}
