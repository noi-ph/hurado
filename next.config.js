/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: [ 'knex' ],
    },
}

module.exports = nextConfig
