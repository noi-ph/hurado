import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers100000000001 implements MigrationInterface {
  name = '100000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "users" (
          "id"              SERIAL    NOT NULL,
          "email"           TEXT      NOT NULL,
          "username"        TEXT      NOT NULL,
          "hashed_password" TEXT      NOT NULL,
          "created_at"      TIMESTAMP NOT NULL DEFAULT NOW(),
          "school"          TEXT,
          "is_admin"        BOOLEAN   NOT NULL DEFAULT false,
          "name"            TEXT      NOT NULL DEFAULT '',
          "country"         TEXT      NOT NULL DEFAULT 'PH', 

          CONSTRAINT "users_uq_username" UNIQUE ("username"), 
          CONSTRAINT "users_uq_email"    UNIQUE ("email"), 
          PRIMARY KEY ("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "files" (
          "id"       SERIAL NOT NULL, 
          "name"     TEXT   NOT NULL, 
          "file_url" TEXT   NOT NULL,

          PRIMARY KEY ("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "scripts" (
          "id"            SERIAL NOT NULL,
          "file_id"       INT    NOT NULL,
          "language_code" TEXT   NOT NULL,
          "runtime_args"  TEXT   NOT NULL,

          PRIMARY KEY ("id"),
          FOREIGN KEY ("file_id") REFERENCES files("id")
        )
      `,
    );

    await queryRunner.query(
      `
        CREATE TABLE "tasks" (
          "id"                    SERIAL  NOT NULL,
          "owner_id"              INT     NOT NULL, 
          "title"                 TEXT    NOT NULL,
          "slug"                  TEXT    NOT NULL UNIQUE,
          "description"           TEXT,
          "statement"             TEXT    NOT NULL,
          "allowed_languages"     TEXT    NOT NULL DEFAULT 'All',
          "task_type"             TEXT    NOT NULL DEFAULT 'Batch',
          "score_max"             FLOAT   NOT NULL,
          "checker_script_id"     INT     NOT NULL,
          "time_limit"            FLOAT   NOT NULL DEFAULT 2,
          "memory_limit"          BIGINT  NOT NULL DEFAULT 1099511627776,
          "compile_time_limit"    FLOAT   NOT NULL DEFAULT 10,
          "compile_memory_limit"  BIGINT  NOT NULL DEFAULT 1099511627776,
          "submission_size_limit" BIGINT  NOT NULL DEFAULT 32768,
          "validator_script_id"   INT     NOT NULL,
          "is_public_in_archive"  BOOLEAN NOT NULL DEFAULT FALSE,
          "language"              TEXT    NOT NULL DEFAULT 'en-US',
      
          PRIMARY KEY ("id"),
          FOREIGN KEY ("owner_id")            REFERENCES users("id"),
          FOREIGN KEY ("checker_script_id")   REFERENCES scripts("id"),
          FOREIGN KEY ("validator_script_id") REFERENCES scripts("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "task_attachments" (
          "id"      SERIAL NOT NULL, 
          "task_id" INT    NOT NULL, 
          "file_id" INT    NOT NULL,

          PRIMARY KEY ("id"),
          FOREIGN KEY ("task_id") REFERENCES tasks("id"),
          FOREIGN KEY ("file_id") REFERENCES files("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "subtasks" (
          "id"                  SERIAL NOT NULL,
          "name"                TEXT   NOT NULL,
          "task_id"             INT    NOT NULL, 
          "order"               INT    NOT NULL,
          "score_max"           INT    NOT NULL,
          "scorer_script_id"    INT    NOT NULL,
          "validator_script_id" INT,
          "test_data_pattern"   TEXT   NOT NULL,
         
          PRIMARY KEY ("id"),
          FOREIGN KEY ("task_id")             REFERENCES tasks("id"),
          FOREIGN KEY ("scorer_script_id")    REFERENCES scripts("id"),
          FOREIGN KEY ("validator_script_id") REFERENCES scripts("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "test_data" (
          "id"             SERIAL  NOT NULL,
          "task_id"        INT     NOT NULL, 
          "order"          INT     NOT NULL,
          "name"           TEXT    NOT NULL,
          "input_file_id"  INT     NOT NULL,
          "output_file_id" INT     NOT NULL,
          "judge_file_id"  INT     NOT NULL,
          "is_sample"      BOOLEAN NOT NULL DEFAULT FALSE,
         
          PRIMARY KEY ("id"),
          FOREIGN KEY ("task_id")        REFERENCES tasks("id"),
          FOREIGN KEY ("input_file_id")  REFERENCES files("id"),
          FOREIGN KEY ("output_file_id") REFERENCES files("id"),
          FOREIGN KEY ("judge_file_id")  REFERENCES files("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "task_developers" (
          "id"      SERIAL NOT NULL,
          "task_id" INT    NOT NULL, 
          "user_id" INT    NOT NULL,
          "order"   INT    NOT NULL,
          "role"    TEXT   NOT NULL,

          PRIMARY KEY ("id"),
          FOREIGN KEY ("task_id") REFERENCES tasks("id"),
          FOREIGN KEY ("user_id") REFERENCES users("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      // still lacking Contest since we don't have model for that yet ^-^
      `
        CREATE TABLE "submissions" (
          "id"            SERIAL    NOT NULL,
          "owner_id"      INT       NOT NULL,
          "task_id"       INT       NOT NULL,
          "created_at"    TIMESTAMP NOT NULL DEFAULT NOW(),
          "language_code" TEXT      NOT NULL,
         
          PRIMARY KEY ("id"),
          FOREIGN KEY ("owner_id") REFERENCES users("id"),
          FOREIGN KEY ("task_id")  REFERENCES tasks("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "submission_files" (
          "id"            SERIAL NOT NULL,
          "submission_id" INT    NOT NULL,
          "file_id"       INT    NOT NULL,
  
          PRIMARY KEY ("id"),
          FOREIGN KEY ("submission_id") REFERENCES submissions("id"),
          FOREIGN KEY ("file_id")       REFERENCES files("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "results" (
          "id"                SERIAL    NOT NULL,
          "submission_id"     INT       NOT NULL,
          "verdict"           TEXT      NOT NULL,
          "running_time"      FLOAT     NOT NULL,
          "running_memory"    BIGINT    NOT NULL,
          "raw_score"         FLOAT     NOT NULL,
          "is_official"       BOOLEAN   NOT NULL,
          "compile_time"      FLOAT     NOT NULL,
          "compile_memory"    BIGINT    NOT NULL,
          "created_at"        TIMESTAMP NOT NULL DEFAULT NOW(),
          "verdict_gotten_at" TIMESTAMP NOT NULL,
         
          PRIMARY KEY ("id"),
          FOREIGN KEY ("submission_id") REFERENCES submissions("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "subtask_results" (
          "id"                SERIAL    NOT NULL,
          "result_id"         INT       NOT NULL,
          "subtask_id"        INT       NOT NULL,
          "verdict"           TEXT      NOT NULL,
          "running_time"      FLOAT     NOT NULL,
          "running_memory"    BIGINT    NOT NULL,
          "raw_score"         FLOAT     NOT NULL,
          "verdict_gotten_at" TIMESTAMP NOT NULL,
         
          PRIMARY KEY ("id"),
          FOREIGN KEY ("result_id")  REFERENCES results("id"),
          FOREIGN KEY ("subtask_id") REFERENCES subtasks("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "test_data_results" (
          "id"                SERIAL    NOT NULL,
          "result_id"         INT       NOT NULL,
          "test_data_id"      INT       NOT NULL,
          "verdict"           TEXT      NOT NULL,
          "running_time"      FLOAT     NOT NULL,
          "running_memory"    BIGINT    NOT NULL,
          "raw_score"         FLOAT     NOT NULL,
          "verdict_gotten_at" TIMESTAMP NOT NULL,
         
          PRIMARY KEY ("id"),
          FOREIGN KEY ("result_id")    REFERENCES results("id"),
          FOREIGN KEY ("test_data_id") REFERENCES test_data("id")
        )
      `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "test_data_results"`, undefined);
    await queryRunner.query(`DROP TABLE "subtask_results"`, undefined);
    await queryRunner.query(`DROP TABLE "results"`, undefined);
    await queryRunner.query(`DROP TABLE "submission_files"`, undefined);
    await queryRunner.query(`DROP TABLE "submissions"`, undefined);
    await queryRunner.query(`DROP TABLE "task_developers"`, undefined);
    await queryRunner.query(`DROP TABLE "test_data"`, undefined);
    await queryRunner.query(`DROP TABLE "subtasks"`, undefined);
    await queryRunner.query(`DROP TABLE "task_attachments"`, undefined);
    await queryRunner.query(`DROP TABLE "tasks"`, undefined);
    await queryRunner.query(`DROP TABLE "scripts"`, undefined);
    await queryRunner.query(`DROP TABLE "files"`, undefined);
    await queryRunner.query(`DROP TABLE "users"`, undefined);
  }
}
