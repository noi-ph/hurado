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
        "isAdmin" BOOLEAN DEFAULT false,
        "school" text,
        "firstName" text NOT NULL DEFAULT 'Juan',
        "lastName" text NOT NULL DEFAULT 'de la Cruz',
        "country" text NOT NULL DEFAULT 'PH', 
        CONSTRAINT "users_uq_username" UNIQUE ("username"), 
        CONSTRAINT "users_uq_email" UNIQUE ("email"), 
        CONSTRAINT "users_pk_id" PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`, undefined);
  }
}
