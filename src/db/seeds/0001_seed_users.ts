import { Knex } from "knex";
import { hashSync } from "bcryptjs";
import { Task, User } from "lib/models";

const hash = (password: string) => hashSync(password, 10);

type SeedUser = Omit<User, "created_at">;

export async function seed(knex: Knex): Promise<void> {
  const users: SeedUser[] = [
    {
      email: "user-4b018dd0-8316@mailinator.com",
      username: "user-4b018dd0-8316",
      hashed_password: hash("password"),
      school: "University of the Philippines - Diliman",
      name: "User 4b018dd0-8316",
    },
  ];
  const tasks: Task[] = [
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
  return knex.transaction(async (trx) => {
    await trx.table("users").insert(users);
    await trx.table("tasks").insert(tasks);
  });
}
