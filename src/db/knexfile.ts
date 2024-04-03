import fs from 'fs';
import dotenv from 'dotenv';
import type { Knex } from 'knex';

let currentPath = process.cwd();

while (!fs.existsSync(`${currentPath}/.env`)) {
  currentPath = `${currentPath}/..`;
  if (currentPath === '/') {
    console.error('Could not find .env file');
    process.exit(1);
  }
}
const ENV_PATH = fs.realpathSync(`${currentPath}/.env`);

console.info(`Loading environment from ${ENV_PATH}`);
dotenv.config({ path: ENV_PATH });

const POSTGRES_HOSTNAME = process.env.IS_UNDER_DOCKER === 'true'
  ? process.env.DOCKER_POSTGRES_HOSTNAME
  : process.env.POSTGRES_HOSTNAME;

const defaults = {
  client: 'pg',
  connection: `
        postgresql://${process.env.POSTGRES_USER}
        :${process.env.POSTGRES_PASSWORD}
        @${POSTGRES_HOSTNAME}
        /${process.env.POSTGRES_DB}
    `.replace(/\s+/g, '').trim(),
  migrations: {
    tableName: 'knex_migrations',
    directory: fs.realpathSync(`${currentPath}/src/db/migrations`),
  },
  seeds: {
    directory: fs.realpathSync(`${currentPath}/src/db/seeds`),
    recursive: true,
  },
};

const config: { [key: string]: Knex.Config } = {
  development: {
    ...defaults,
    debug: false,
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, done: any) => {
        console.debug('Pool created');
        done(false, conn);
      },
    },
  },
  production: defaults,
};

export default config;
