import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFiles100000000002 implements MigrationInterface {
  name = '100000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "files"`, undefined);
  }
}
