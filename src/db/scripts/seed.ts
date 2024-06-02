import { hashSync } from "bcryptjs";
import { Kysely } from "kysely";
import { Models, TaskCreate, UserCreate } from "db/types";
import { db } from "../index";

const hash = (password: string) => hashSync(password, 10);

seed_database(db);

async function seed_database(db: Kysely<Models>): Promise<void> {
  if (process.env.ENVIRONMENT === "development") {
    try {
      actually_seed_database(db);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  } else {
    console.error("Resetting the database only works on development");
    process.exit(2);
  }
}

async function actually_seed_database(db: Kysely<Models>) {
  const users: UserCreate[] = [
    {
      email: "user-4b018dd0-8316@mailinator.com",
      username: "user-4b018dd0-8316",
      hashed_password: hash("password"),
      school: "University of the Philippines - Diliman",
      name: "User 4b018dd0-8316",
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
