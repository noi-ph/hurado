import fs from "fs";
import dotenv from "dotenv";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Models } from "./types"; // this is the Database interface we defined earlier

let currentPath = process.cwd();

while (!fs.existsSync(`${currentPath}/.env`)) {
  currentPath = `${currentPath}/..`;
  if (currentPath === "/") {
    console.error("Could not find .env file");
    process.exit(1);
  }
}
const ENV_PATH = fs.realpathSync(`${currentPath}/.env`);

console.info(`Loading environment from ${ENV_PATH}`);
dotenv.config({ path: ENV_PATH });

const POSTGRES_HOSTNAME =
  process.env.IS_UNDER_DOCKER === "true"
    ? process.env.DOCKER_POSTGRES_HOSTNAME
    : process.env.POSTGRES_HOSTNAME;

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.POSTGRES_DB,
    host: POSTGRES_HOSTNAME,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: +process.env.POSTGRES_PORT!,
    max: 10,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Models>({
  dialect,
});
