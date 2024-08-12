import { Kysely, sql } from "kysely";
import { SCRIPTS_ONLY_DATABASE } from "./do-not-import-this";

reset_database(SCRIPTS_ONLY_DATABASE);

async function reset_database(db: Kysely<any>): Promise<void> {
  if (process.env.ENVIRONMENT === "development") {
    try {
      db.transaction().execute(async (trx) => {
        await sql`DROP SCHEMA public CASCADE`.execute(trx);
        await sql`CREATE SCHEMA public`.execute(trx);
      });
      console.info("Wiped the database");
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  } else {
    console.error("Resetting the database only works on development");
    process.exit(2);
  }
}
