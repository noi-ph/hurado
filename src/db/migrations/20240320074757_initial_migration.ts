import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    return trx.schema
      .createTable("users", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.text("email").notNullable().unique();
        table.text("username").notNullable().unique();
        table.text("hashed_password").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        // TODO: Implement user roles (e.g., admin, user, etc.)
        table.text("school");
        table.text("name");
        table.text("country");
        table.index("username");
        table.index("email");
      })
      .createTable("tasks", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.text("slug").notNullable().unique();
        table.text("title").notNullable();
        table.text("description");
        table.text("statement").notNullable();
        table.decimal("score_max", 10, 4).notNullable().defaultTo(100.0);
        table.text("mvp_output"); // Delete this later. It's just for making progress
        table.float("time_limit").defaultTo(2.0); // in seconds
        table.integer("memory_limit").unsigned().defaultTo(100000); // in bytes
        table.index("slug");
      })
      .createTable("files", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.text("name").notNullable();
        table.integer("size").notNullable();
        table.text("url");
      })
      .createTable("scripts", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.uuid("file_id").notNullable().references("id").inTable("files");
        table.text("language_code").notNullable();
        table.text("runtime_args");
      })
      .createTable("submissions", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.uuid("user_id").notNullable().references("id").inTable("users");
        table.uuid("task_id").notNullable().references("id").inTable("tasks");
        table.text("language_code").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.text("runtime_args");
        table.uuid("official_result_id");
        table.index(["created_at", "user_id", "task_id"]);
        table.index(["created_at", "task_id"]);
      })
      .createTable("submission_files", (table) => {
        table
          .uuid("submission_id")
          .notNullable()
          .references("id")
          .inTable("submissions");
        table.uuid("file_id").notNullable().references("id").inTable("files");
        table.primary(["submission_id", "file_id"]);
      })
      .createTable("results", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table
          .uuid("submission_id")
          .notNullable()
          .references("id")
          .inTable("submissions");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.text("verdict");
        table.integer("raw_score");
        table.integer("running_time_ms");
        table.integer("running_memory_byte");
        table.integer("compile_time_ms");
        table.integer("compile_memory_byte");
        table.index(["submission_id", "created_at"]);
      })
      .createTable("contests", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.text("slug").notNullable().unique();
        table.text("title").notNullable();
        table.text("description");
        table.uuid("owner_id").notNullable().references("id").inTable("users");
        table.timestamp("start_time").notNullable().defaultTo(knex.fn.now());
        table.timestamp("end_time");
        table.index("slug");
      })
      .alterTable("submissions", (table) => {
        table
          .uuid("official_result_id")
          .alter()
          .references("id")
          .inTable("results");
      });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.transaction(async (trx) => {
    return trx.schema
      .alterTable("submissions", (table) => {
        table.dropForeign(["official_result_id"]);
      })
      .dropTable("results")
      .dropTable("submission_files")
      .dropTable("submissions")
      .dropTable("scripts")
      .dropTable("files")
      .dropTable("users")
      .dropTable("tasks")
      .dropTable("contests");
  });
}
