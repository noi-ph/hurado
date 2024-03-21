import type { Knex } from 'knex'

import fs from 'fs'
import dotenv from 'dotenv'

const PWD: string = process.cwd()
const ENV_PATH = fs.realpathSync(`${PWD}/../.env`)

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
        directory: fs.realpathSync(`${PWD}/migrations`),
    },
    seeds: {
        directory: fs.realpathSync(`${PWD}/seeds`),
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
