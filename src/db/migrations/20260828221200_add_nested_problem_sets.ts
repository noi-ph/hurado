// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { Kysely, sql } from "kysely";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
export async function up(db: Kysely<any>): Promise<void> {
  // 1. Create problem_set_nesteds table
  await db.schema
    .createTable("problem_set_nesteds")
    .addColumn("parent_id", "uuid", (col) =>
      col.notNull().references("problem_sets.id").onDelete("cascade")
    )
    .addColumn("child_id", "uuid", (col) =>
      col.notNull().references("problem_sets.id").onDelete("cascade")
    )
    .addColumn("order", "integer", (col) => col.notNull())
    .addPrimaryKeyConstraint("problem_set_nesteds_pk", ["parent_id", "child_id"])
    .execute();

  await db.schema
    .createIndex("idx_problem_set_nesteds_parent_id_order")
    .on("problem_set_nesteds")
    .columns(["parent_id", "order"])
    .execute();

  await db.schema
    .createIndex("idx_problem_set_nesteds_child_id")
    .on("problem_set_nesteds")
    .columns(["child_id"])
    .execute();

  // 2. Seed the root problem set
  await db
    .insertInto("problem_sets")
    .values({
      slug: "root",
      title: "Problem Sets",
      description: "",
      is_public: true,
      order: 0,
    })
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("problem_sets").where("slug", "=", "root").execute();

  await db.schema.dropTable("problem_set_nesteds").execute();
}
