import '@root/reset.css'
import '@root/global.css'

import type { FunctionComponent, ReactNode } from 'react'
import type { Metadata } from 'next'

import Link from 'next/link'

import { Work_Sans } from 'next/font/google'

import styles from './layout.module.css'

export const metadata: Metadata = {
    title: {
        template: '%s | Algurado',
        default: 'Algurado',
    },
    description: 'NOI.PH\'s online judge.',
}

type props = { children: ReactNode }

const worksans = Work_Sans({
    weight: 'variable',
    style: [ 'normal', 'italic' ],
    subsets: [ 'latin' ],
})

const RootLayout: FunctionComponent<props> = ({ children }) => (
    <html lang='en'>
        <body className={ worksans.className }>
            <header id={ styles.navbar }>
                <div className={ styles.desktoplinks }>
                    <Link href='/'>Home</Link>
                    <Link href='/login'>Login</Link>
                    <Link href='/register'>Register</Link>
                </div>
                <Link href='/sitemap'>Sitemap</Link>
            </header>
            <main>{ children }</main>
            <footer>
                <p className={ styles.copyright }>© 2024 NOI.PH</p>
            </footer>
        </body>
    </html>
)

export default RootLayout
