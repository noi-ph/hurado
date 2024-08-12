import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Models } from "../../common/types";

// I don't know a less scuffed way to do this, so here it is.
console.warn('Warning: If you are seeing this message and you did not just run a dev-only script, someone has messed up.');

const POSTGRES_HOSTNAME =
  process.env.IS_UNDER_DOCKER === "true"
    ? process.env.DOCKER_POSTGRES_HOSTNAME
    : process.env.POSTGRES_HOSTNAME;

const POSTGRES_DB = process.env.POSTGRES_DB;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_PORT = +process.env.POSTGRES_PORT!;


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
export const SCRIPTS_ONLY_DATABASE = new Kysely<Models>({
  dialect,
});
