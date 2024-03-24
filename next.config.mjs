import nextMDX from '@next/mdx'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

const withMdx = nextMDX({
    options: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeHighlight, rehypeKatex],
    },
})

/** @type {import('next').NextConfig} */
export default withMdx({
    pageExtensions: [ 'js', 'jsx', 'mdx', 'ts', 'tsx' ],
    experimental: {
        serverComponentsExternalPackages: [ 'knex' ],
    },
    // Add the following due to non-support of knex dir
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
})
