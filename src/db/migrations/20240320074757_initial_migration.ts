import { Kysely, sql } from "kysely";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col
        .primaryKey()
        .defaultTo(sql`uuid_generate_v4()`)
        .notNull()
    )
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("username", "text", (col) => col.notNull().unique())
    .addColumn("hashed_password", "text", (col) => col.notNull())
    .addColumn("school", "text")
    .addColumn("name", "text")
    .addColumn("country", "text")
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("password_reset_token", "text")
    .addColumn("password_reset_expires_at", "text")
    .addColumn("kompgen_token", "text")
    .execute();

  await db.schema
    .createIndex("idx_users_password_reset_token")
    .on("users")
    .columns(["password_reset_token"])
    .where("password_reset_token", "is not", null)
    .unique()
    .execute();

  await db.schema
    .createIndex("idx_users_kompgen_token")
    .on("users")
    .columns(["kompgen_token"])
    .where("kompgen_token", "is not", null)
    .unique()
    .execute();

  await db.schema
    .createTable("files")
    .addColumn("hash", "text", (col) => col.primaryKey())
    .addColumn("size", "bigint", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("tasks")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
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
    .addColumn("checker_id", "uuid")
    .addColumn("communicator_id", "uuid")
    .addColumn("allowed_languages", sql`text[]`)
    .addColumn("owner_id", "uuid", (col) => col.notNull().references("users.id"))
    .execute();

  await db.schema.createIndex("idx_tasks_slug").on("tasks").columns(["slug"]).execute();
  await db.schema.createIndex("idx_tasks_owner_id_created_at").on("tasks").columns(["owner_id", "created_at"]).execute();

  await db.schema
    .createTable("task_scripts")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("task_id", "uuid", (col) => col.notNull())
    .addColumn("file_name", "text", (col) => col.notNull())
    .addColumn("file_hash", "text", (col) => col.notNull().references("files.hash"))
    .addColumn("language", "text", (col) => col.notNull())
    .addColumn("argv", sql`text[]`)
    .execute();

  await db.schema
    .alterTable("tasks")
    .addForeignKeyConstraint("fk_tasks_checker_id", ["checker_id"], "task_scripts", ["id"])
    .onDelete("restrict")
    .execute();

  await db.schema
    .alterTable("tasks")
    .addForeignKeyConstraint("fk_tasks_communicator_id", ["communicator_id"], "task_scripts", ["id"])
    .onDelete("restrict")
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
    .createIndex("idx_task_credits_task_id")
    .on("task_credits")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createTable("task_attachments")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("path", "text", (col) => col.notNull())
    .addColumn("mime_type", "text", (col) => col.notNull())
    .addColumn("file_hash", "text", (col) => col.notNull().references("files.hash"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createIndex("idx_task_attachments_task_id")
    .on("task_attachments")
    .columns(["task_id"])
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
    .createIndex("idx_task_subtasks_task_id")
    .on("task_subtasks")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createTable("task_data")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .addColumn("input_file_name", "text")
    .addColumn("input_file_hash", "text", (col) => col.references("files.hash"))
    .addColumn("judge_file_name", "text", (col) => col.notNull())
    .addColumn("judge_file_hash", "text", (col) => col.notNull().references("files.hash"))
    .addColumn("subtask_id", "uuid", (col) =>
      col.notNull().references("task_subtasks.id").onDelete("cascade")
    )
    .execute();

  await db.schema
    .createIndex("idx_task_data_subtask_task_id")
    .on("task_data")
    .columns(["subtask_id"])
    .execute();

  await db.schema
    .createTable("task_sample_io")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .addColumn("order", "integer", (col) => col.notNull())
    .addColumn("input", "text")
    .addColumn("output", "text")
    .addColumn("explanation", "text")
    .execute();

  await db.schema
    .createIndex("idx_task_sample_io_task_id")
    .on("task_sample_io")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createTable("submissions")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .addColumn("contest_id", "uuid")
    .addColumn("language", "text", (col) => col.notNull())
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

  // These are distinct from files because there's going to be way more of these
  // and our garbage collection routines can check if they're unneeded with just one join
  // unlike files which need to check all scripts, attachments, multiple columns of task data
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
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("submission_id", "uuid", (col) => col.notNull().references("submissions.id"))
    .addColumn("verdict", "text")
    .addColumn("score_raw", "real")
    .addColumn("is_official", "boolean")
    .addColumn("running_time_ms", "integer")
    .addColumn("running_memory_byte", "integer")
    .addColumn("compile_time_ms", "integer")
    .addColumn("compile_memory_byte", "integer")
    .execute();

  await db.schema
    .createTable("verdict_subtasks")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("verdict_id", "uuid", (col) => col.notNull().references("verdicts.id").onDelete('cascade'))
    .addColumn("subtask_id", "uuid", (col) => col.notNull().references("task_subtasks.id").onDelete('cascade'))
    .addColumn("verdict", "text")
    .addColumn("score_raw", "real")
    .addColumn("running_time_ms", "integer")
    .addColumn("running_memory_byte", "integer")
    .execute();

  await db.schema
    .createTable("verdict_task_data")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("verdict_subtask_id", "uuid", (col) =>
      col.notNull().references("verdict_subtasks.id")
    )
    .addColumn("task_data_id", "uuid", (col) => col.notNull().references("task_data.id").onDelete('cascade'))
    .addColumn("verdict", "text")
    .addColumn("score_raw", "real")
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
    .createTable("problem_sets")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("is_public", "boolean", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_problem_sets_order")
    .on("problem_sets")
    .where(sql.ref("is_public"), "=", true)
    .columns(["order"])
    .execute();

  await db.schema
    .createTable("problem_set_tasks")
    .addColumn("set_id", "uuid", (col) => col.notNull().references("problem_sets.id"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id"))
    .addColumn("order", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_problem_set_tasks_set_id_order")
    .on("problem_set_tasks")
    .columns(["set_id", "order"])
    .execute();

  await db.schema
    .createIndex("idx_problem_set_tasks_task_id")
    .on("problem_set_tasks")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createTable("contests")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("statement", "text", (col) => col.notNull())
    .addColumn("owner_id", "uuid", (col) => col.notNull().references("users.id"))
    .addColumn("is_public", "boolean", (col) => col.notNull())
    .addColumn("start_time", "timestamp")
    .addColumn("end_time", "timestamp")
    .execute();

  await db.schema.createIndex("idx_contests_slug").on("contests").columns(["slug"]).execute();

  await db.schema
    .createTable("overall_verdicts")
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id").onDelete("cascade"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id").onDelete("cascade"))
    .addColumn("contest_id", "uuid", (col) => col.references("contests.id").onDelete("set null"))
    .addColumn("score_overall", "double precision")
    .addColumn("score_max", "double precision")
    .addUniqueConstraint(
      "idx_overall_verdicts_contest_id_user_id_task_id",
      ["contest_id", "user_id", "task_id"],
      (eb) => eb.nullsNotDistinct(),
    )
    .execute();

  await db.schema
    .alterTable("submissions")
    .addForeignKeyConstraint("fk_submissions_contest_id", ["contest_id"], "contests", ["id"])
    .onDelete("set null")
    .execute();

  await db.schema
    .createTable("contest_tasks")
    .addColumn("contest_id", "uuid", (col) => col.notNull().references("contests.id"))
    .addColumn("task_id", "uuid", (col) => col.notNull().references("tasks.id"))
    .addColumn("score_max", "double precision", (col) => col.notNull())
    .addColumn("letter", "text", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_contest_tasks_contest_id")
    .on("contest_tasks")
    .columns(["contest_id"])
    .execute();

  await db.schema
    .createIndex("idx_contest_tasks_task_id")
    .on("contest_tasks")
    .columns(["task_id"])
    .execute();

  await db.schema
    .createTable("contest_attachments")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn("path", "text", (col) => col.notNull())
    .addColumn("mime_type", "text", (col) => col.notNull())
    .addColumn("file_hash", "text", (col) => col.notNull().references("files.hash"))
    .addColumn("contest_id", "uuid", (col) =>
      col.notNull().references("contests.id").onDelete("cascade")
    )
    .execute();

  await db.schema
    .createIndex("idx_contest_attachments_contest_id")
    .on("contest_attachments")
    .columns(["contest_id"])
    .execute();

  await db.schema
    .createTable("participations")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("user_id", "uuid", (col) => col.notNull().references("users.id"))
    .addColumn("contest_id", "uuid", (col) => col.notNull().references("contests.id"))
    .addColumn("is_hidden", "boolean", (col) => col.notNull())
    .addColumn("is_unrestricted", "boolean", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("idx_participations_user_id_contest_id")
    .on("participations")
    .columns(["user_id", "contest_id"])
    .execute();

  await db.schema
    .createIndex("idx_participations_contest_id_user_id")
    .on("participations")
    .columns(["contest_id", "user_id"])
    .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("submissions")
    .dropConstraint("fk_submissions_official_result_id")
    .execute();

  await db.schema.dropTable("participations").execute();
  await db.schema.dropTable("contest_attachments").execute();
  await db.schema.dropTable("contest_tasks").execute();
  await db.schema.dropTable("contests").execute();
  await db.schema.dropTable("overall_verdicts").execute();
  await db.schema.dropTable("verdict_task_data").execute();
  await db.schema.dropTable("verdict_subtasks").execute();
  await db.schema.dropTable("verdicts").execute();
  await db.schema.dropTable("submission_files").execute();
  await db.schema.dropTable("submissions").execute();
  await db.schema.dropTable("task_sample_io").execute();
  await db.schema.dropTable("task_data").execute();
  await db.schema.dropTable("task_subtasks").execute();
  await db.schema.dropTable("task_attachments").execute();
  await db.schema.dropTable("task_credits").execute();
  await db.schema.dropTable("tasks").execute();
  await db.schema.dropTable("task_scripts").execute();
  await db.schema.dropTable("files").execute();
  await db.schema.dropTable("users").execute();
}
