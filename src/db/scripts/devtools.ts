import { promises as fs } from "fs";
import path from "path";
import { FileMigrationProvider, Insertable, Migrator, sql } from "kysely";
import { db } from "db";
import { TaskCreate, UserTable } from "common/types";
import { SubmissionFileStorage, TaskFileStorage } from "server/files";
import { __DO_NOT_IMPORT__DeveloperSeeds } from "./seed";

class DeveloperTools {
  static async resetDatabase() {
    console.log("Creating");
    await DeveloperTools.recreateDatabase();
    console.log("Migrating");
    await DeveloperTools.migrateDatabase();
    console.log("Seeding");
    await DeveloperTools.seedDatabase();
  }

  static async recreateDatabase(): Promise<void> {
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
      console.error(
        "Resetting the database only works on development. Do it manually if you're sure."
      );
      process.exit(2);
    }
  }

  static async migrateDatabase() {
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

  static async seedDatabase(): Promise<void> {
    if (process.env.ENVIRONMENT === "development") {
      try {
        __DO_NOT_IMPORT__DeveloperSeeds.run();
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    } else {
      console.error("Seeding the database only works on development");
      process.exit(2);
    }
  }

  static async initStorage() {
    await TaskFileStorage.createIfNotExists();
    await SubmissionFileStorage.createIfNotExists();
  }
}

function main() {
  if (process.argv.length < 3) {
    console.error(`Missing positional argument: mode`);
    process.exit(1);
  }

  const mode = process.argv[2];
  switch (mode) {
    case "db:recreate":
      return DeveloperTools.recreateDatabase();
    case "db:migrate":
      return DeveloperTools.migrateDatabase();
    case "db:seed":
      return DeveloperTools.seedDatabase();
    case "db:reset":
      return DeveloperTools.resetDatabase();
    case "storage:init":
      return DeveloperTools.initStorage();
    default:
      console.error(`Invalid argument: '${mode}'`);
  }
}

main();
