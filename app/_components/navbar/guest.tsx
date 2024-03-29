import type { FunctionComponent } from 'react'

import Link from 'next/link'

import styles from './index.module.css'

export const Guest: FunctionComponent = () => (
    <div className={`${styles.row} ${styles.desktoplinks}`}>
        <Link href='/login'>Login</Link>
        <Link href='/register'>Register</Link>
    </div>
)
