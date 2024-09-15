import { db } from "db";
import { ContestEditorDTO } from "common/validation/contest_validation";

export async function getEditorContest(uuid: string): Promise<ContestEditorDTO | null> {
  const contest = await db
    .selectFrom("contests")
    .select([
      "id",
      "title",
      "slug",
      "description",
      "statement",
      "is_public",
      "start_time",
      "end_time",
      "owner_id",
    ])
    .where("id", "=", uuid)
    .executeTakeFirst();

  if (contest == null) {
    return null;
  }

  const attachments = await db
    .selectFrom("contest_attachments")
    .select(["id", "path", "mime_type", "file_hash"])
    .where("contest_id", "=", contest.id)
    .execute();

  const tasks = await db
    .selectFrom("contest_tasks")
    .innerJoin("tasks", "id", "task_id")
    .select([
      "tasks.id",
      "tasks.title",
      "tasks.slug",
      "contest_tasks.score_max",
      "contest_tasks.order",
      "contest_tasks.letter",
    ])
    .where("contest_id", "=", contest.id)
    .orderBy("order")
    .execute();

  const contestDTO: ContestEditorDTO = {
    id: contest.id,
    slug: contest.slug,
    title: contest.title,
    description: contest.description,
    statement: contest.statement,
    is_public: contest.is_public,
    start_time: contest.start_time,
    end_time: contest.end_time,
    owner_id: contest.owner_id,
    attachments: attachments.map((att) => ({
      id: att.id,
      path: att.path,
      file_hash: att.file_hash,
      mime_type: att.mime_type,
    })),
    tasks: tasks.map((task) => ({
      task_id: task.id,
      title: task.title,
      slug: task.slug,
      score_max: task.score_max,
      letter: task.letter,
      order: task.order,
    })),
  };

  return contestDTO;
}
