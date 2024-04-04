import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("tasks").insert([
    {
      slug: "who-is-the-oldest",
      title: "Who is the oldest?",
      statement: [
        "Alvin, Berto, and Carlo are friends. Their ages are $$A$$, $$B$$ and $$C$$, respectively. No two of them have the same age. Who is the oldest among them?",
        "The input contains three lines. The first line contains a single integer, $$A$$. The second line contains a single integer, $$B$$. The third line contains a single integer, $$C$$.",
        "Output the name of the oldest among the three, which should be either Alvin, Berto or Carlo.",
      ].join("\n"),
    },
  ]);
}
