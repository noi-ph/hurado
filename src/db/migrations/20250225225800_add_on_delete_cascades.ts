import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("submission_files")
    .dropConstraint('submission_files_submission_id_fkey')
    .execute();

  await db.schema
    .alterTable("submission_files")
    .addForeignKeyConstraint(
      'submission_files_submission_id_fkey',
      ['submission_id'],
      'submissions',
      ['id'],
    )
    .onDelete('cascade')
    .execute();
  
  await db.schema
    .alterTable("verdicts")
    .dropConstraint("verdicts_submission_id_fkey")
    .execute();

  await db.schema
    .alterTable("verdicts")
    .addForeignKeyConstraint(
      'verdicts_submission_id_fkey',
      ['submission_id'],
      'submissions',
      ['id'],
    )
    .onDelete('cascade')
    .execute();

  await db.schema
    .alterTable("verdict_task_data")
    .dropConstraint("verdict_task_data_verdict_subtask_id_fkey")
    .execute();
  
  await db.schema
    .alterTable("verdict_task_data")
    .addForeignKeyConstraint(
      'verdict_task_data_verdict_subtask_id_fkey',
      ['verdict_subtask_id'],
      'verdict_subtasks',
      ['id'],
    )
    .onDelete('cascade')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("verdict_task_data")
    .dropConstraint('verdict_task_data_verdict_subtask_id_fkey')
    .execute();
  
  
  await db.schema
    .alterTable("verdict_task_data")
    .addForeignKeyConstraint(
      'verdict_task_data_verdict_subtask_id_fkey',
      ['verdict_subtask_id'],
      'verdict_subtasks',
      ['id'],
    )
    .execute();

  await db.schema
    .alterTable("verdicts")
    .dropConstraint('verdicts_submission_id_fkey')
    .execute();

  await db.schema
    .alterTable("verdicts")
    .addForeignKeyConstraint(
      'verdicts_submission_id_fkey',
      ['submission_id'],
      'submissions',
      ['id'],
    )
    .execute();

  await db.schema
    .alterTable("submission_files")
    .dropConstraint('submission_files_submission_id_fkey')
    .execute();


  await db.schema
    .alterTable("submission_files")
    .addForeignKeyConstraint(
      'submission_files_submission_id_fkey',
      ['submission_id'],
      'submissions',
      ['id'],
    )
    .execute();
}