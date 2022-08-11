import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers100000000001 implements MigrationInterface {
  name = '100000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        CREATE TABLE "users" (
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
          CONSTRAINT "users_pk_id" PRIMARY KEY ("id")
        )
      `,
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
        CREATE TABLE "scripts" (
          "id" SERIAL NOT NULL,
          "fileId" int NOT NULL,
          "languageCode" text NOT NULL,
          "runtimeArgs" text NOT NULL,

          PRIMARY KEY("id"),
          FOREIGN KEY("fileId") REFERENCES Files("id")
        )
      `,
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
          "allowedLanguages" text NOT NULL DEFAULT 'All',
          "taskType" text NOT NULL DEFAULT 'Batch',
          "scoreMax" float NOT NULL,
          "checkerScriptId" int NOT NULL,
          "timeLimit" float NOT NULL DEFAULT 2,
          "memoryLimit" bigint NOT NULL DEFAULT 1099511627776,
          "compileTimeLimit" float NOT NULL DEFAULT 10,
          "compileMemoryLimit" bigint NOT NULL DEFAULT 1099511627776,
          "submissionSizeLimit" bigint NOT NULL DEFAULT 32768,
          "validatorScriptId" int NOT NULL,
          "isPublicInArchive" boolean NOT NULL DEFAULT FALSE,
          "language" text NOT NULL DEFAULT 'en-US',
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      
          PRIMARY KEY("id"),
          FOREIGN KEY("ownerId") REFERENCES Users("id"),
          FOREIGN KEY("checkerScriptId") REFERENCES Scripts("id"),
          FOREIGN KEY ("validatorScriptId") REFERENCES Scripts("id")
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
          "scorerScriptId" int NOT NULL,
          "validatorScriptId" int,
          "testDataPattern" text NOT NULL,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("taskId") REFERENCES Tasks("id"),
          FOREIGN KEY("scorerScriptId") REFERENCES Scripts("id"),
          FOREIGN KEY ("validatorScriptId") REFERENCES Scripts("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "testData" (
          "id" SERIAL NOT NULL,
          "taskId" int NOT NULL, 
          "order" int NOT NULL,
          "name" text NOT NULL,
          "inputFileId" int NOT NULL,
          "outputFileId" int NOT NULL,
          "judgeFileId" int NOT NULL,
          "isSample" boolean NOT NULL DEFAULT FALSE,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("taskId") REFERENCES Tasks("id"),
          FOREIGN KEY("inputFileId") REFERENCES Files("id"),
          FOREIGN KEY("outputFileId") REFERENCES Files("id"),
          FOREIGN KEY("judgeFileId") REFERENCES Files("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "taskDevelopers" (
          "id" SERIAL NOT NULL,
          "taskId" int NOT NULL, 
          "userId" int NOT NULL,
          "order" int NOT NULL,
          "role" text NOT NULL,

          PRIMARY KEY("id"),
          FOREIGN KEY("taskId") REFERENCES Tasks("id"),
          FOREIGN KEY("userId") REFERENCES Users("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      // still lacking Contest since we don't have model for that yet ^-^
      `
        CREATE TABLE "submissions" (
          "id" SERIAL NOT NULL,
          "ownerId" int NOT NULL,
          "taskId" int NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "languageCode" text NOT NULL,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("ownerId") REFERENCES Users("id"),
          FOREIGN KEY("taskId") REFERENCES Tasks("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "submissionFiles" (
          "id" SERIAL NOT NULL,
          "submissionId" int NOT NULL,
          "fileId" int NOT NULL,
  
          PRIMARY KEY("id"),
          FOREIGN KEY("submissionId") REFERENCES Submissions("id"),
          FOREIGN KEY("fileId") REFERENCES Files("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "results" (
          "id" SERIAL NOT NULL,
          "submissionId" int NOT NULL,
          "verdict" text NOT NULL,
          "runningTime" float NOT NULL,
          "runningMemory" bigint NOT NULL,
          "rawScore" float NOT NULL,
          "isOfficial" boolean NOT NULL,
          "compileTime" float NOT NULL,
          "compileMemory" bigint NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "verdictGottenAt" TIMESTAMP NOT NULL,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("submissionId") REFERENCES Submissions("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "subtaskResults" (
          "id" SERIAL NOT NULL,
          "resultId" int NOT NULL,
          "subtaskId" int NOT NULL,
          "verdict" text NOT NULL,
          "runningTime" float NOT NULL,
          "runningMemory" bigint NOT NULL,
          "rawScore" float NOT NULL,
          "verdictGottenAt" TIMESTAMP NOT NULL,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("resultId") REFERENCES Results("id"),
          FOREIGN KEY("subtaskId") REFERENCES Subtasks("id")
        )
      `,
      undefined,
    );

    await queryRunner.query(
      `
        CREATE TABLE "testDataResults" (
          "id" SERIAL NOT NULL,
          "resultId" int NOT NULL,
          "testDataId" int NOT NULL,
          "verdict" text NOT NULL,
          "runningTime" float NOT NULL,
          "runningMemory" bigint NOT NULL,
          "rawScore" float NOT NULL,
          "verdictGottenAt" TIMESTAMP NOT NULL,
         
          PRIMARY KEY("id"),
          FOREIGN KEY("resultId") REFERENCES Results("id"),
          FOREIGN KEY("testDataId") REFERENCES "testData"("id")
        )
      `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "testDataResults"`, undefined);
    await queryRunner.query(`DROP TABLE "subtaskResults"`, undefined);
    await queryRunner.query(`DROP TABLE "results"`, undefined);
    await queryRunner.query(`DROP TABLE "submissionFiles"`, undefined);
    await queryRunner.query(`DROP TABLE "submissions"`, undefined);
    await queryRunner.query(`DROP TABLE "taskDevelopers"`, undefined);
    await queryRunner.query(`DROP TABLE "testData"`, undefined);
    await queryRunner.query(`DROP TABLE "subtasks"`, undefined);
    await queryRunner.query(`DROP TABLE "taskAttachments"`, undefined);
    await queryRunner.query(`DROP TABLE "tasks"`, undefined);
    await queryRunner.query(`DROP TABLE "scripts"`, undefined);
    await queryRunner.query(`DROP TABLE "files"`, undefined);
    await queryRunner.query(`DROP TABLE "users"`, undefined);
  }
}
