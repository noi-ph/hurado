import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col
        .primaryKey()
        .defaultTo(sql`uuid_generate_v4()`)
        .notNull()
    )
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("username", "text", (col) => col.notNull().unique())
    .addColumn("hashed_password", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("school", "text")
    .addColumn("name", "text")
    .addColumn("country", "text")
    .execute();

  await db.schema
    .createTable("tasks")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col)
    .addColumn("statement", "text", (col) => col.notNull())
    .addColumn("score_max", "decimal", (col) => col.notNull())
    .addColumn("mvp_output", "text") // Delete this later. It's just for making progress
    .execute();

  await db.schema
    .createTable("files")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("url", "text")
    .execute();

  await db.schema
    .createTable("scripts")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("file_id", "uuid", (col) => col.notNull().references("files.id"))
    .addColumn("language_code", "text", (col) => col.notNull())
    .addColumn("runtime_args", "text")
    .execute();

  await db.schema
    .createTable("submissions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id"))
    .addColumn("language_code", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("runtime_args", "text")
    .addColumn("official_result_id", "uuid")
    .execute();

  await db.schema
    .createIndex("idx_submissions_created_at_user_id_task_id")
    .on("submissions")
    .columns(["created_at", "user_id", "task_id"])
    .execute();

  await db.schema
    .createIndex("idx_submissions_created_at_task_id")
    .on("submissions")
    .columns(["created_at", "task_id"])
    .execute();

  await db.schema
    .createTable("submission_files")
    .addColumn("submission_id", "uuid", (col) =>
      col.notNull().references("submissions.id")
    )
    .addColumn("file_id", "uuid", (col) => col.notNull().references("files.id"))
    .addPrimaryKeyConstraint("pk_submission_files", [
      "submission_id",
      "file_id",
    ])
    .execute();

  await db.schema
    .createTable("results")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("submission_id", "uuid", (col) =>
      col.notNull().references("submissions.id")
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("verdict", "text")
    .addColumn("raw_score", "integer")
    .addColumn("running_time_ms", "integer")
    .addColumn("running_memory_byte", "integer")
    .addColumn("compile_time_ms", "integer")
    .addColumn("compile_memory_byte", "integer")
    .execute();

  await db.schema
    .createIndex("idx_results_submission_id_created_at")
    .on("results")
    .columns(["submission_id", "created_at"])
    .execute();

  await db.schema
    .createTable("contests")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("owner_id", "uuid", (col) =>
      col.notNull().references("users.id")
    )
    .addColumn("start_time", "timestamp")
    .addColumn("end_time", "timestamp")
    .execute();

  await db.schema
    .alterTable("submissions")
    .addForeignKeyConstraint(
      "fk_submissions_official_result_id",
      ["official_result_id"],
      "results",
      ["id"]
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("submissions")
    .dropConstraint("fk_submissions_official_result_id")
    .execute();

  await db.schema.dropTable("contests").execute();
  await db.schema.dropTable("results").execute();
  await db.schema.dropTable("submission_files").execute();
  await db.schema.dropTable("submissions").execute();
  await db.schema.dropTable("scripts").execute();
  await db.schema.dropTable("files").execute();
  await db.schema.dropTable("tasks").execute();
  await db.schema.dropTable("users").execute();
}
