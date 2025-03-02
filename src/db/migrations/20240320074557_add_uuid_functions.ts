import { Kysely, sql } from "kysely";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "citext"`.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP EXTENSION "citext"`.execute(db);
  await sql`DROP EXTENSION "uuid-ossp"`.execute(db);
}
