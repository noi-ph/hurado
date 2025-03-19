import { DeveloperToolsDatabase } from "./database";
import { DeveloperToolsCRUD } from "./crud";

function main() {
  if (process.argv.length < 3) {
    console.error(`Missing positional argument: mode`);
    process.exit(1);
  }

  const mode = process.argv[2];
  switch (mode) {
    case "db:recreate":
      return DeveloperToolsDatabase.recreateDatabase();
    case "db:migrate":
      return DeveloperToolsDatabase.migrateDatabase();
    case "db:seed":
      return DeveloperToolsDatabase.seedDatabase();
    case "db:reset":
      return DeveloperToolsDatabase.resetDatabase();
    case "storage:init":
      return DeveloperToolsDatabase.initStorage();
    case "admin:create":
      return DeveloperToolsCRUD.adminCreate();
    case "admin:update":
      return DeveloperToolsCRUD.adminUpdate();
    default:
      console.error(`Invalid argument: "${mode}"`);
  }
}

function fastMain() {
  const promise = main();
  if (promise == null) {
    process.exit(0);
  }

  promise
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      if (e instanceof Error && e.stack) {
        console.error(e.stack);
      } else {
        console.error(e);
      }
      process.exit(1);
    });
}

fastMain();
