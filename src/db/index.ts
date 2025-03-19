import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import {
  POSTGRES_DB,
  POSTGRES_HOSTNAME,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from "server/secrets";
import { Models } from "common/types"; // this is the Database interface we defined earlier

const dialect = new PostgresDialect({
  pool: new Pool({
    database: POSTGRES_DB,
    host: POSTGRES_HOSTNAME,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
    max: 2,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Models>({
  dialect,
});
