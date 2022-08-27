import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers100000000001 implements MigrationInterface {
  name = '100000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    await queryRunner.query(`
      CREATE TABLE files (
        id       uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        name     TEXT   NOT NULL,
        size     INT    NOT NULL,
        contents BYTEA  NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE scripts (
        id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        file_id       uuid    NOT NULL,
        language_code TEXT   NOT NULL,
        runtime_args  TEXT   NOT NULL,

        FOREIGN KEY (file_id) REFERENCES files (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        email           TEXT      NOT NULL UNIQUE,
        username        TEXT      NOT NULL UNIQUE,
        hashed_password TEXT      NOT NULL,
        created_at      TIMESTAMP NOT NULL DEFAULT now(),
        is_admin        BOOLEAN   NOT NULL DEFAULT FALSE,
        school          TEXT,
        name            TEXT,
        country         TEXT      NOT NULL DEFAULT 'PH'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE tasks (
        id                    uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner_id              uuid    NOT NULL,
        title                 TEXT    NOT NULL,
        slug                  TEXT    NOT NULL UNIQUE,
        description           TEXT,
        statement             TEXT    NOT NULL,
        allowed_languages     TEXT    NOT NULL DEFAULT 'All',
        task_type             TEXT    NOT NULL,
        score_max             INT     NOT NULL,
        checker_script_id     uuid    NOT NULL,
        time_limit            INT     NOT NULL DEFAULT 2,
        memory_limit          INT     NOT NULL DEFAULT 1099511627776,
        compile_time_limit    INT     NOT NULL DEFAULT 10,
        compile_memory_limit  INT     NOT NULL DEFAULT 1099511627776,
        submission_size_limit INT     NOT NULL DEFAULT 32768,
        validator_script_id   uuid    NOT NULL,
        is_public_in_archive  BOOLEAN NOT NULL DEFAULT FALSE,
        
        FOREIGN KEY (owner_id)            REFERENCES users   (id),
        FOREIGN KEY (checker_script_id)   REFERENCES scripts (id),
        FOREIGN KEY (validator_script_id) REFERENCES scripts (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE task_attachments (
        id      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        task_id uuid   NOT NULL,
        file_id uuid   NOT NULL,

        FOREIGN KEY (task_id) REFERENCES tasks (id),
        FOREIGN KEY (file_id) REFERENCES files (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE subtasks (
        id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        name                TEXT   NOT NULL,
        task_id             uuid   NOT NULL,
        "order"               INT    NOT NULL,
        score_max           INT    NOT NULL,
        scorer_script_id    uuid   NOT NULL,
        validator_script_id uuid   NOT NULL,
        test_data_pattern   TEXT[] NOT NULL DEFAULT '{}',

        FOREIGN KEY (task_id)             REFERENCES tasks   (id),
        FOREIGN KEY (scorer_script_id)    REFERENCES scripts (id),
        FOREIGN KEY (validator_script_id) REFERENCES scripts (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE test_data (
        id             uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        task_id        uuid    NOT NULL,
        "order"          INT     NOT NULL,
        name           TEXT    NOT NULL,
        input_file_id  uuid    NOT NULL,
        output_file_id uuid    NOT NULL,
        judge_file_id  uuid,
        is_sample      BOOLEAN NOT NULL DEFAULT FALSE,

        FOREIGN KEY (task_id)        REFERENCES tasks (id),
        FOREIGN KEY (input_file_id)  REFERENCES files (id),
        FOREIGN KEY (output_file_id) REFERENCES files (id),
        FOREIGN KEY (judge_file_id)  REFERENCES files (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE task_developers (
        id      uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        task_id uuid   NOT NULL,
        user_id uuid   NOT NULL,
        "order"   INT    NOT NULL,
        role    TEXT   NOT NULL,

        FOREIGN KEY (task_id) REFERENCES tasks (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE contests (
        id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner_id    uuid      NOT NULL,
        title       TEXT      NOT NULL,
        slug        TEXT      NOT NULL UNIQUE,
        description TEXT,
        start_time  TIMESTAMP NOT NULL,
        end_time    TIMESTAMP NOT NULL,

        FOREIGN KEY (owner_id) REFERENCES users (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE contest_tasks (
        id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        contest_id uuid   NOT NULL,
        task_id    uuid   NOT NULL,
        letter     TEXT   NOT NULL,
        "order"      INT    NOT NULL,

        FOREIGN KEY (contest_id) REFERENCES contests (id),
        FOREIGN KEY (task_id)    REFERENCES tasks    (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE participations (
        id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id         uuid      NOT NULL,
        contest_id      uuid      NOT NULL,
        is_hidden       BOOLEAN   NOT NULL,
        is_unrestricted BOOLEAN   NOT NULL,
        hashed_password TEXT,
        created_at      TIMESTAMP NOT NULL DEFAULT now(),

        FOREIGN KEY (user_id)    REFERENCES users    (id),
        FOREIGN KEY (contest_id) REFERENCES contests (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE submissions (
        id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        owner_id      uuid      NOT NULL,
        contest_id    uuid      NOT NULL,
        task_id       uuid      NOT NULL,
        created_at    TIMESTAMP NOT NULL DEFAULT now(),
        language_code TEXT      NOT NULL,
        result_id     uuid      NOT NULL,

        FOREIGN KEY (owner_id)   REFERENCES users    (id),
        FOREIGN KEY (contest_id) REFERENCES contests (id),
        FOREIGN KEY (task_id)    REFERENCES tasks    (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE submission_files (
        id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        submission_id uuid   NOT NULL,
        file_id       uuid   NOT NULL,

        FOREIGN KEY (submission_id) REFERENCES submissions (id),
        FOREIGN KEY (file_id)       REFERENCES files       (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE results (
        id                uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        submission_id     uuid      NOT NULL,
        verdict           TEXT      NOT NULL,
        running_time      INT       NOT NULL,
        running_memory    INT       NOT NULL,
        raw_score         INT       NOT NULL,
        is_official       BOOLEAN   NOT NULL,
        compile_time      INT       NOT NULL,
        compile_memory    INT       NOT NULL,
        created_at        TIMESTAMP NOT NULL DEFAULT now(),
        verdict_gotten_at TIMESTAMP NOT NULL,

        FOREIGN KEY (submission_id) REFERENCES submissions (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE subtask_results (
        id                uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        result_id         uuid      NOT NULL,
        subtask_id        uuid      NOT NULL,
        verdict           TEXT      NOT NULL,
        running_time      INT       NOT NULL,
        running_memory    INT       NOT NULL,
        raw_score         INT       NOT NULL,
        verdict_gotten_at TIMESTAMP NOT NULL,

        FOREIGN KEY (result_id)  REFERENCES results  (id),
        FOREIGN KEY (subtask_id) REFERENCES subtasks (id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE test_data_results (
        id                uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        result_id         uuid NOT NULL,
        test_data_id      uuid NOT NULL,
        verdict           TEXT NOT NULL,
        running_time      INT  NOT NULL,
        running_memory    INT  NOT NULL,
        raw_score         INT  NOT NULL,
        verdict_gotten_at TIMESTAMP NOT NULL,

        FOREIGN KEY (result_id)    REFERENCES results   (id),
        FOREIGN KEY (test_data_id) REFERENCES test_data (id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE test_data_results');
    await queryRunner.query('DROP TABLE subtask_results');
    await queryRunner.query('DROP TABLE results');
    await queryRunner.query('DROP TABLE submission_files');
    await queryRunner.query('DROP TABLE submissions');
    await queryRunner.query('DROP TABLE participations');
    await queryRunner.query('DROP TABLE contest_tasks');
    await queryRunner.query('DROP TABLE contests');
    await queryRunner.query('DROP TABLE task_developers');
    await queryRunner.query('DROP TABLE test_data');
    await queryRunner.query('DROP TABLE subtasks');
    await queryRunner.query('DROP TABLE task_attachments');
    await queryRunner.query('DROP TABLE tasks');
    await queryRunner.query('DROP TABLE users');
    await queryRunner.query('DROP TABLE scripts');
    await queryRunner.query('DROP TABLE files');
    await queryRunner.query('DROP EXTENSION "uuid-ossp"');
  }
}
