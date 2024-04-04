import createKnex, { Knex } from "knex";

import config from "../knexfile";

const knex: Knex = createKnex(config.development);
reset_database(knex);

export async function reset_database(knex: Knex): Promise<void> {
  if (process.env.ENVIRONMENT === "development") {
    try {
      await knex.raw(`DROP SCHEMA public CASCADE`);
      await knex.raw(`CREATE SCHEMA public`);
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  } else {
    console.error("Resetting the database only works on development");
    process.exit(2);
  }
}
