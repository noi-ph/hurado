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
        <body className={ worksans.className } style={{
            width: '100%',
            height: 'fit-content',

            display: 'flex',
            flexDirection: 'column',
        }}>
            <header id={ styles.navbar }>
                <div className={ styles.desktoplinks } style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',

                    width: 'fit-content',
                    height: 'fit-content',
                    gap: '20px',
                }}>
                    <Link href='/'>Home</Link>
                    <Link href='/login'>Login</Link>
                    <Link href='/register'>Register</Link>
                </div>
                <Link href='/sitemap'>Sitemap</Link>
            </header>
            <main style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',

                width: '100%',
                height: 'fit-content',
                gap: '15px',
            }}>{ children }</main>
            <footer style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',

                width: '100%',
                height: 'fit-content',
                padding: '5px 20px',
            }}>
                <p style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                    width: '100%',
                    height: 'fit-content',
                }}>© 2024 NOI.PH</p>
            </footer>
        </body>
    </html>
)

export default RootLayout
