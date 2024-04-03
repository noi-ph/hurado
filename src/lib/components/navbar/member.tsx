import type { FunctionComponent } from 'react'

import Link from 'next/link'

import styles from './index.module.css'

export const Member: FunctionComponent = () => (
    <div className={`${styles.row} ${styles.desktoplinks}`}>
        <Link href='/tasks'>Tasks</Link>
        <Link href='/login'>Logout</Link>
    </div>
)
