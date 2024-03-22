/** @type {import('next').NextConfig} */
module.exports = {
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
}
