import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers100000000001 implements MigrationInterface {
  name = '100000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" text NOT NULL,
        "username" text NOT NULL,
        "hashedPassword" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "school" text,
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "firstName" text NOT NULL DEFAULT 'Juan',
        "lastName" text NOT NULL DEFAULT 'dela Cruz',
        "country" text NOT NULL DEFAULT 'PH', 
        CONSTRAINT "users_uq_username" UNIQUE ("username"), 
        CONSTRAINT "users_uq_email" UNIQUE ("email"), 
        CONSTRAINT "users_pk_id" PRIMARY KEY ("id"))`,
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
          "ownerId" int NOT NULL, 
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
          FOREIGN KEY("ownerId") REFERENCES Users("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "taskAttachments" (
          "id" SERIAL NOT NULL, 
          "taskId" int NOT NULL, 
          "fileId" int NOT NULL,
          PRIMARY KEY ("id"),
          FOREIGN KEY("taskId") REFERENCES Tasks("id"),
          FOREIGN KEY("fileId") REFERENCES Files("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "subtasks" (
          "id" SERIAL NOT NULL,
          "name" text NOT NULL,
          "taskId" int NOT NULL, 
          "order" int NOT NULL,
          "scoreMax" int NOT NULL,
          "scorer" text NOT NULL,
          "validator" text,
          "testDataPattern" text NOT NULL,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("taskId") REFERENCES Tasks("id")
        )
      `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subtasks"`, undefined);
    await queryRunner.query(`DROP TABLE "taskAttachments"`, undefined);
    await queryRunner.query(`DROP TABLE "tasks"`, undefined);
    await queryRunner.query(`DROP TABLE "files"`, undefined);
    await queryRunner.query(`DROP TABLE "users"`, undefined);
  }
}
