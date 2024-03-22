import type { Knex } from 'knex'

import fs from 'fs'
import dotenv from 'dotenv'

let currentPath = process.cwd()

while (!fs.existsSync(`${currentPath}/.env`)) {
    currentPath = `${currentPath}/..`
    if (currentPath === '/') {
        console.error('Could not find .env file')
        process.exit(1)
    }
}
const ENV_PATH = fs.realpathSync(`${currentPath}/.env`)

console.log(`Loading environment from ${ENV_PATH}`)
dotenv.config({ path: ENV_PATH })

const defaults = {
    client: 'pg',
    connection: `
        postgresql://${ process.env.DB_USER }
        :${ process.env.DB_PASS }
        @${ process.env.DB_HOST }
        /${ process.env.DB_NAME }
    `.replace(/\s+/g, '').trim(),
    migrations: {
        tableName: 'knex_migrations',
        directory: fs.realpathSync(`${currentPath}/knex/migrations`),
    },
    seeds: {
        directory: fs.realpathSync(`${currentPath}/knex/seeds`),
        recursive: true,
    },
}

const config: { [key: string]: Knex.Config } = {
    development: {
        ...defaults,
        debug: true,
        useNullAsDefault: true,
        pool: {
            afterCreate: (conn: any, done: any) => {
                console.log('Pool created')
                done(false, conn)
            }
        },
    },
    production: defaults,
}

export default config
