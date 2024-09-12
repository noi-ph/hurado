import { Selectable, Transaction } from "kysely";
import { db } from "db";
import { ContestAttachmentTable, Models } from "common/types";
import { normalizeAttachmentPath } from "common/utils/attachments";
import {
  ContestAttachmentDTO,
  ContestDTO,
  ContestTaskDTO,
} from "common/validation/contest_validation";

type Ordered<T> = T & {
  order: number;
};

function makeOrdered<T>(arr: T[]): Ordered<T>[] {
  return arr.map((obj, index) => ({
    ...obj,
    order: index + 1,
  }));
}

async function upsertContestAttachments(
  trx: Transaction<Models>,
  contestId: string,
  attachments: ContestAttachmentDTO[]
): Promise<Selectable<ContestAttachmentTable>[]> {
  const attachmentsNew = attachments.filter((attachment) => attachment.id == null);
  const attachmentsOld = attachments.filter((attachment) => attachment.id != null);

  const attachmentsOldIds = attachmentsOld.map((attachment) => attachment.id as string);
  if (attachmentsOldIds.length <= 0) {
    await trx.deleteFrom("contest_attachments").where("contest_id", "=", contestId).execute();
  } else {
    await trx
      .deleteFrom("contest_attachments")
      .where("contest_id", "=", contestId)
      .where("id", "not in", attachmentsOldIds)
      .execute();
  }

  const dbAttachmentsNew =
    attachmentsNew.length <= 0
      ? []
      : await trx
          .insertInto("contest_attachments")
          .values(
            attachmentsNew.map((attach) => ({
              path: normalizeAttachmentPath(attach.path),
              mime_type: attach.mime_type,
              file_hash: attach.file_hash,
              contest_id: contestId,
            }))
          )
          .returningAll()
          .execute();

  const dbAttachmentsUpdate =
    attachmentsOld.length <= 0
      ? []
      : await trx
          .insertInto("contest_attachments")
          .values(
            attachmentsOld.map((attach) => ({
              id: attach.id,
              path: attach.path,
              mime_type: attach.mime_type,
              file_hash: attach.file_hash,
              contest_id: contestId,
            }))
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              path: eb.ref("excluded.path"),
              mime_type: eb.ref("excluded.mime_type"),
              file_hash: eb.ref("excluded.file_hash"),
              task_id: eb.ref("excluded.contest_id"),
            }))
          )
          .returningAll()
          .execute();

  return [...dbAttachmentsNew, ...dbAttachmentsUpdate];
}

async function upsertContestTasks(
  trx: Transaction<Models>,
  contestId: string,
  tasks: ContestTaskDTO[]
): Promise<ContestTaskDTO[]> {
  const tasksOrdered = makeOrdered(tasks);
  await trx.deleteFrom("contest_tasks").where("contest_id", "=", contestId).execute();

  const dbContestTasks =
    tasksOrdered.length <= 0
      ? []
      : await trx
          .insertInto("contest_tasks")
          .values(
            tasksOrdered.map((task) => ({
              contest_id: contestId,
              task_id: task.task_id,
              letter: task.letter,
              order: task.order,
            }))
          )
          .returning(["task_id", "letter", "order"])
          .execute();

  dbContestTasks.sort((a, b) => a.order - b.order);
  const dtos: ContestTaskDTO[] = dbContestTasks.map((ct) => ({
    task_id: ct.task_id,
    letter: ct.letter,
  }));

  return dtos;
}

export async function updateContest(contest: ContestDTO): Promise<ContestDTO> {
  return db.transaction().execute(async (trx): Promise<ContestDTO> => {
    const dbContest = await trx
      .updateTable("contests")
      .set({
        slug: contest.slug,
        title: contest.title,
        description: contest.description ?? undefined,
        is_public: contest.is_public,
        start_time: contest.start_time,
        end_time: contest.end_time,
      })
      .where("id", "=", contest.id)
      .returning(["id", "slug", "title", "description", "is_public", "start_time", "end_time"])
      .executeTakeFirstOrThrow();

    const dbContestAttachments = await upsertContestAttachments(
      trx,
      contest.id,
      contest.attachments
    );
    const dbContestTasks = await upsertContestTasks(trx, contest.id, contest.tasks);

    return {
      id: dbContest.id,
      slug: dbContest.slug,
      title: dbContest.title,
      description: dbContest.description,
      is_public: dbContest.is_public,
      start_time: dbContest.start_time,
      end_time: dbContest.end_time,
      attachments: dbContestAttachments.map((att) => ({
        id: att.id,
        path: att.path,
        file_hash: att.file_hash,
        mime_type: att.mime_type,
      })),
      tasks: dbContestTasks,
    };
  });
}
