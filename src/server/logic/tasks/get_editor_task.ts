import { db } from "db";
import { checkUUIDv4 } from "common/utils/uuid";
import { TaskDataDTO, TaskDTO } from "common/validation/task_validation";

export async function getEditorTask(idOrSlug: string): Promise<TaskDTO | null> {
  const task = await db
    .selectFrom("tasks")
    .select(["id", "title", "slug", "description", "statement", "score_max"])
    .where((eb) => eb.or([eb("slug", "=", idOrSlug), eb("id", "=", checkUUIDv4(idOrSlug))]))
    .executeTakeFirst();

  if (task == null) {
    return null;
  }

  const attachments = await db
    .selectFrom("task_attachments")
    .select(["id", "path", "mime_type", "file_hash"])
    .where("task_id", "=", task.id)
    .execute();

  const credits = await db
    .selectFrom("task_credits")
    .select(["id", "name", "role"])
    .where("task_id", "=", task.id)
    .orderBy("order")
    .execute();

  const subtasks = await db
    .selectFrom("task_subtasks")
    .select(["id", "name", "order", "score_max"])
    .where("task_id", "=", task.id)
    .orderBy("order")
    .execute();

  const data =
    subtasks.length > 0
      ? await db
          .selectFrom("task_data")
          .select([
            "id",
            "subtask_id",
            "name",
            "order",
            "is_sample",
            "input_file_name",
            "input_file_hash",
            "output_file_name",
            "output_file_hash",
            "judge_file_name",
            "judge_file_hash",
          ])
          .where(
            "subtask_id",
            "in",
            subtasks.map((x) => x.id)
          )
          .orderBy(["subtask_id", "order"])
          .execute()
      : [];

  const toTaskDataDTO = (d: (typeof data)[number]): TaskDataDTO => {
    return {
      id: d.id,
      name: d.name,
      is_sample: d.is_sample,
      input_file_name: d.input_file_name,
      input_file_hash: d.input_file_hash,
      output_file_name: d.output_file_name,
      output_file_hash: d.output_file_hash,
      judge_file_name: d.judge_file_name,
      judge_file_hash: d.judge_file_hash,
    };
  };

  const editor: TaskDTO = {
    ...task,
    checker: "fake-checker",
    credits: credits.map((cred) => ({
      id: cred.id,
      name: cred.name,
      role: cred.role,
    })),
    attachments: attachments.map((att) => ({
      id: att.id,
      path: att.path,
      file_hash: att.file_hash,
      mime_type: att.mime_type,
    })),
    subtasks: subtasks.map((sub) => ({
      id: sub.id,
      name: sub.name,
      score_max: sub.score_max,
      data: data.filter((d) => d.subtask_id === sub.id).map(toTaskDataDTO),
    })),
  };

  return editor;
}
