import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers100000000001 implements MigrationInterface {
  name = '100000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying(100) NOT NULL,
        "username" character varying(40),
        "hashedPassword" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "school" character varying(40),
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "country" character varying(30) NOT NULL DEFAULT 'PH', 
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), 
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "files" (
          "id" SERIAL NOT NULL, 
          "name" text NOT NULL, 
          "fileURL" text NOT NULL,
          CONSTRAINT "files_pk_id" PRIMARY KEY ("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "tasks" (
          "id" SERIAL NOT NULL,
          "ownerID" int NOT NULL, 
          "title" text NOT NULL,
          "slug" text NOT NULL UNIQUE,
          "description" text,
          "statement" text NOT NULL,
          "allowedLanguages" text NOT NULL,
          "taskType" text NOT NULL,
          "scoreMax" float NOT NULL,
          "checker" text NOT NULL,
          "timeLimit" float NOT NULL DEFAULT 2,
          "memoryLimit" bigint NOT NULL DEFAULT 1099511627776,
          "compileTimeLimit" float NOT NULL DEFAULT 10,
          "compileMemoryLimit" bigint NOT NULL DEFAULT 1099511627776,
          "submissionSizeLimit" bigint NOT NULL DEFAULT 32768,
          "validator" text NOT NULL,
          "isPublicInArchive" boolean NOT NULL DEFAULT FALSE,
          "language" text NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      
          PRIMARY KEY("id"),
          FOREIGN KEY("ownerID") REFERENCES Users("id")
        )
      `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tasks"`, undefined);
    await queryRunner.query(`DROP TABLE "files"`, undefined);
    await queryRunner.query(`DROP TABLE "users"`, undefined);
  }
}
