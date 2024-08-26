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
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("school", "text")
    .addColumn("name", "text")
    .addColumn("country", "text")
    .addColumn("role", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("task_files")
    .addColumn("hash", "text", (col) => col.primaryKey())
    .addColumn("size", "bigint", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("task_scripts")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("task_id", "uuid", (col) => col.notNull())
    .addColumn("file_name", "text", (col) => col.notNull())
    .addColumn("file_hash", "text", (col) => col.notNull().references("task_files.hash"))
    .addColumn("language", "text", (col) => col.notNull())
    .addColumn("argv", sql`text[]`)
    .execute();

  await db.schema
    .createTable("tasks")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col)
    .addColumn("statement", "text", (col) => col.notNull())
    .addColumn("is_public", "boolean", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("flavor", "text")
    .addColumn("score_max", "double precision", (col) => col.notNull())
    .addColumn("time_limit_ms", "integer")
    .addColumn("memory_limit_byte", "bigint")
    .addColumn("compile_time_limit_ms", "integer")
    .addColumn("compile_memory_limit_byte", "bigint")
    .addColumn("submission_size_limit_byte", "integer")
    .addColumn("checker_kind", "text", (col) => col.notNull())
    .addColumn("checker_id", "uuid", (col) => col.references("task_scripts.id"))
    .addColumn("allowed_languages", sql`text[]`)
    .execute();

  await db.schema
    .alterTable("task_scripts")
    .addForeignKeyConstraint("fk_task_scripts_task_id", ["task_id"], "tasks", ["id"])
    .onDelete("cascade")
    .execute();

  await db.schema
    .createTable("task_credits")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("task_attachments")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("path", "text", (col) => col.notNull())
    .addColumn("mime_type", "text", (col) => col.notNull())
    .addColumn("file_hash", "text", (col) => col.notNull().references("task_files.hash"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("task_subtasks")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .addColumn("score_max", "double precision", (col) => col.notNull())
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("task_data")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .addColumn("is_sample", "boolean", (col) => col.notNull())
    .addColumn("input_file_name", "text")
    .addColumn("input_file_hash", "text", (col) => col.references("task_files.hash"))
    .addColumn("judge_file_name", "text", (col) => col.notNull())
    .addColumn("judge_file_hash", "text", (col) => col.notNull().references("task_files.hash"))
    .addColumn("subtask_id", "uuid", (col) =>
      col.notNull().references("task_subtasks.id").onDelete("cascade")
    )
    .execute();

  await db.schema.createIndex("idx_tasks_slug").on("tasks").columns(["slug"]).execute();

  await db.schema
    .createIndex("idx_task_attachments_task_id")
    .on("task_attachments")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createIndex("idx_task_credits_task_id")
    .on("task_credits")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createIndex("idx_task_subtasks_task_id")
    .on("task_subtasks")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createIndex("idx_task_data_subtask_task_id")
    .on("task_data")
    .columns(["subtask_id"])
    .execute();

  await db.schema
    .createTable("submissions")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .addColumn("language", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("official_verdict_id", "uuid")
    .execute();

  await db.schema
    .createIndex("idx_submissions_user_id_task_id_created_at")
    .on("submissions")
    .columns(["user_id", "task_id", "created_at"])
    .execute();

  await db.schema
    .createIndex("idx_submissions_task_id_created_at")
    .on("submissions")
    .columns(["created_at", "task_id"])
    .execute();

  // These are distinct from task_files because there's going to be way more of these
  // and our garbage collection routines can check if they're unneeded with just one join
  // unlike task_files which need to check all scripts, attachments, multiple columns of task data
  // and some of those aren't indexed. For these ones, we can just make sure to index
  await db.schema
    .createTable("submission_files")
    .addColumn("hash", "text")
    .addColumn("size", "bigint", (col) => col.notNull())
    .addColumn("submission_id", "uuid", (col) => col.notNull().references("submissions.id"))
    .addColumn("file_name", "text")
    .execute();

  await db.schema
    .createIndex("idx_submissions_files_submission_id")
    .on("submission_files")
    .columns(["submission_id"])
    .execute();

  await db.schema
    .createIndex("idx_submissions_files_hash")
    .on("submission_files")
    .columns(["hash"])
    .execute();

  await db.schema
    .createTable("verdicts")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("submission_id", "uuid", (col) => col.notNull().references("submissions.id"))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("verdict", "text")
    .addColumn("raw_score", "real")
    .addColumn("is_official", "boolean")
    .addColumn("running_time_ms", "integer")
    .addColumn("running_memory_byte", "integer")
    .addColumn("compile_time_ms", "integer")
    .addColumn("compile_memory_byte", "integer")
    .execute();

  await db.schema
    .createTable("verdict_subtasks")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("verdict_id", "uuid", (col) => col.notNull().references("verdicts.id"))
    .addColumn("subtask_id", "uuid", (col) => col.notNull().references("task_subtasks.id"))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("verdict", "text")
    .addColumn("raw_score", "real")
    .addColumn("running_time_ms", "integer")
    .addColumn("running_memory_byte", "integer")
    .execute();

  await db.schema
    .createTable("verdict_task_data")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("verdict_subtask_id", "uuid", (col) =>
      col.notNull().references("verdict_subtasks.id")
    )
    .addColumn("task_data_id", "uuid", (col) => col.notNull().references("task_data.id"))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("verdict", "text")
    .addColumn("raw_score", "real")
    .addColumn("running_time_ms", "integer")
    .addColumn("running_memory_byte", "integer")
    .execute();

  await db.schema
    .createIndex("idx_verdicts_submission_id")
    .on("verdicts")
    .columns(["submission_id"])
    .execute();

  await db.schema
    .createIndex("idx_verdict_subtasks_verdict_id")
    .on("verdict_subtasks")
    .columns(["verdict_id"])
    .execute();

  await db.schema
    .createIndex("idx_verdict_task_data_verdict_subtask_id")
    .on("verdict_task_data")
    .columns(["verdict_subtask_id"])
    .execute();

  await db.schema
    .alterTable("submissions")
    .addForeignKeyConstraint(
      "fk_submissions_official_verdict_id",
      ["official_verdict_id"],
      "verdicts",
      ["id"]
    )
    .execute();

  await db.schema
    .createTable("contests")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("owner_id", "uuid", (col) => col.notNull().references("users.id"))
    .addColumn("start_time", "timestamp")
    .addColumn("end_time", "timestamp")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("submissions")
    .dropConstraint("fk_submissions_official_result_id")
    .execute();

  await db.schema.dropTable("contests").execute();
  await db.schema.dropTable("verdicts").execute();
  await db.schema.dropTable("submissions").execute();
  await db.schema.dropTable("scripts").execute();
  await db.schema.dropTable("task_files").execute();
  await db.schema.dropTable("tasks").execute();
  await db.schema.dropTable("users").execute();
}
