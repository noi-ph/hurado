import '@root/reset.css'
import '@root/global.css'

import type { FunctionComponent, ReactNode } from 'react'
import type { Metadata } from 'next'

import { Work_Sans } from 'next/font/google'

import styles from './layout.module.css'

import { Navbar } from '@components'

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
        <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossOrigin="anonymous"></link>
        </head>
        <body className={ worksans.className }>
            <header id={ styles.navbar }>
                <Navbar />
            </header>
            <main>{ children }</main>
            <footer>
                <p className={ styles.copyright }>© 2024 NOI.PH</p>
            </footer>
        </body>
    </html>
)

export default RootLayout
