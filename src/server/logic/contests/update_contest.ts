import { Transaction } from "kysely";
import { db } from "db";
import { Models } from "common/types";
import { normalizeAttachmentPath } from "common/utils/attachments";
import {
  ContestAttachmentUpdateDTO,
  ContestUpdateDTO,
  ContestEditorDTO,
  ContestTaskUpdateDTO,
  ContestTaskEditorDTO,
  ContestAttachmentEditorDTO,
} from "common/validation/contest_validation";
import { notNull } from "common/utils/guards";

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
  attachments: ContestAttachmentUpdateDTO[]
): Promise<ContestAttachmentEditorDTO[]> {
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

  return [...dbAttachmentsNew, ...dbAttachmentsUpdate].map((att) => ({
    id: att.id,
    path: att.path,
    file_hash: att.file_hash,
    mime_type: att.mime_type,
  }));
}

async function upsertContestTasks(
  trx: Transaction<Models>,
  contestId: string,
  tasks: ContestTaskUpdateDTO[]
): Promise<ContestTaskEditorDTO[]> {
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
              score_max: task.score_max,
              order: task.order,
            }))
          )
          .returning(["task_id", "letter", "score_max", "order"])
          .execute();

  dbContestTasks.sort((a, b) => a.order - b.order);
  const dbTasks =
    tasksOrdered.length <= 0
      ? []
      : await trx
          .selectFrom("tasks")
          .where(
            "id",
            "in",
            dbContestTasks.map((t) => t.task_id)
          )
          .select(["id", "slug", "title"])
          .execute();

  const taskMap = new Map(dbTasks.map((t) => [t.id, t]));

  const dtos: ContestTaskEditorDTO[] = dbContestTasks
    .map((ct, index) => {
      const task = taskMap.get(ct.task_id);
      if (task == null) {
        return null;
      }
      return {
        task_id: task.id,
        slug: task.slug!,
        title: task.title!,
        score_max: ct.score_max,
        letter: ct.letter,
        order: index,
      };
    })
    .filter(notNull);

  return dtos;
}

export async function updateContest(contest: ContestUpdateDTO): Promise<ContestEditorDTO> {
  return db.transaction().execute(async (trx): Promise<ContestEditorDTO> => {
    const dbContest = await trx
      .updateTable("contests")
      .set({
        slug: contest.slug,
        title: contest.title,
        description: contest.description,
        statement: contest.statement,
        is_public: contest.is_public,
        start_time: contest.start_time,
        end_time: contest.end_time,
      })
      .where("id", "=", contest.id)
      .returning([
        "id",
        "owner_id",
        "slug",
        "title",
        "description",
        "statement",
        "is_public",
        "start_time",
        "end_time",
      ])
      .executeTakeFirstOrThrow();

    const contestAttachments = await upsertContestAttachments(trx, contest.id, contest.attachments);
    const contestTasks = await upsertContestTasks(trx, contest.id, contest.tasks);

    return {
      id: dbContest.id,
      owner_id: dbContest.owner_id,
      slug: dbContest.slug,
      title: dbContest.title,
      description: dbContest.description,
      statement: dbContest.statement,
      is_public: dbContest.is_public,
      start_time: dbContest.start_time,
      end_time: dbContest.end_time,
      attachments: contestAttachments,
      tasks: contestTasks,
    };
  });
}
