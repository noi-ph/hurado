import { hashSync } from "bcryptjs";
import { promises as fs } from "fs";
import { FileMigrationProvider, Insertable, Kysely, Migrator, PostgresDialect, sql } from "kysely";
import * as path from "path";
import { Pool } from "pg";
import { Models, TaskCreate, UserTable } from "common/types";


// I don't know a less scuffed way to do this, so here it is.
console.warn(
  "Warning: If you are seeing this message and you did not just run a dev-only script, someone has messed up."
);

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

const SCRIPTS_ONLY_DATABASE = new Kysely<Models>({
  dialect,
});

export class __DO_NOT_IMPORT__DeveloperDatabaseScripts {
  static async seed_database() {
    __DO_NOT_IMPORT__DeveloperDatabaseScripts._seed_database(SCRIPTS_ONLY_DATABASE);
  }

  static async migrate_database() {
    __DO_NOT_IMPORT__DeveloperDatabaseScripts._migrate_database(SCRIPTS_ONLY_DATABASE);
  }

  static async recreate_database() {
    __DO_NOT_IMPORT__DeveloperDatabaseScripts._recreate_database(SCRIPTS_ONLY_DATABASE);
  }

  static async reset_database() {
    console.log('Creating');
    await __DO_NOT_IMPORT__DeveloperDatabaseScripts._recreate_database(SCRIPTS_ONLY_DATABASE);
    console.log('Migrating');
    await __DO_NOT_IMPORT__DeveloperDatabaseScripts._migrate_database(SCRIPTS_ONLY_DATABASE);
    console.log('Seeding');
    await __DO_NOT_IMPORT__DeveloperDatabaseScripts._seed_database(SCRIPTS_ONLY_DATABASE);
  }

  private static async _recreate_database(db: Kysely<any>): Promise<void> {
    if (process.env.ENVIRONMENT === "development") {
      try {
        await db.transaction().execute(async (trx) => {
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

  private static async _migrate_database(db: Kysely<any>) {
    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        // This needs to be an absolute path.
        migrationFolder: path.join(__dirname, "../migrations"),
      }),
    });

    const { error, results } = await migrator.migrateToLatest();

    results?.forEach((it) => {
      if (it.status === "Success") {
        console.info(`migration "${it.migrationName}" was executed successfully`);
      } else if (it.status === "Error") {
        console.error(`failed to execute migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error("failed to migrate");
      console.error(error);
      process.exit(1);
    }
  }

  private static async _seed_database(db: Kysely<Models>): Promise<void> {
    if (process.env.ENVIRONMENT === "development") {
      try {
        __DO_NOT_IMPORT__DeveloperDatabaseScripts._actually_seed_database(db);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    } else {
      console.error("Resetting the database only works on development");
      process.exit(2);
    }
  }

  private static async _actually_seed_database(db: Kysely<Models>) {
    const users: Insertable<UserTable>[] = [
      {
        email: "kevin@example.com",
        username: "kevin",
        hashed_password: hashPassword("password"),
        school: "University of the Philippines - Diliman",
        name: "Kevin Sogo",
        role: "admin",
      },
    ];
    const tasks: TaskCreate[] = [
      {
        slug: "who-is-the-oldest",
        title: "Who is the oldest?",
        statement: [
          "Alvin, Berto, and Carlo are friends. Their ages are $$A$$, $$B$$ and $$C$$, respectively. No two of them have the same age. Who is the oldest among them?",
          "The input contains three lines. The first line contains a single integer, $$A$$. The second line contains a single integer, $$B$$. The third line contains a single integer, $$C$$.",
          "Output the name of the oldest among the three, which should be either Alvin, Berto or Carlo.",
        ].join("\n"),
        score_max: 100,
      },
    ];

    return db.transaction().execute(async (trx) => {
      await trx.insertInto("users").values(users).execute();
      await trx.insertInto("tasks").values(tasks).execute();
    });
  }
}

function hashPassword(password: string) {
  return hashSync(password, 10);
}
