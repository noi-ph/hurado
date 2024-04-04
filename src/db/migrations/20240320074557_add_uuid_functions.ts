import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    await trx.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await trx.raw(`CREATE EXTENSION IF NOT EXISTS "citext"`);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    await trx.raw(`DROP EXTENSION "citext"`);
    await trx.raw(`DROP EXTENSION "uuid-ossp"`);
  });
}
