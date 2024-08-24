import { db } from "db";
import { huradoIDToUUID } from "common/utils/uuid";
import {
  TaskBatchDTO,
  TaskDataBatchDTO,
  TaskDataDTO,
  TaskDataOutputDTO,
  TaskDTO,
  TaskOutputDTO,
} from "common/validation/task_validation";
import { TaskType } from "common/types/constants";
import { NotYetImplementedError, UnreachableError } from "common/errors";

export async function getEditorTask(idOrSlug: string): Promise<TaskDTO | null> {
  const uuid = huradoIDToUUID(idOrSlug);
  const task = await db
    .selectFrom("tasks")
    .select([
      "id",
      "title",
      "slug",
      "description",
      "statement",
      "type",
      "score_max",
      "checker_kind",
      "checker_id",
      "is_public",
      "time_limit_ms",
      "memory_limit_byte",
      "compile_time_limit_ms",
      "compile_memory_limit_byte",
      "submission_size_limit_byte",
    ])
    .where((eb) => eb.or([eb("slug", "=", idOrSlug), eb("id", "=", uuid)]))
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

  if (task.type === TaskType.Batch) {
    const toTaskDataBatchDTO = (d: (typeof data)[number]): TaskDataBatchDTO => {
      return {
        id: d.id,
        name: d.name,
        is_sample: d.is_sample,
        input_file_name: d.input_file_name as string,
        input_file_hash: d.input_file_hash as string,
        output_file_name: d.output_file_name,
        output_file_hash: d.output_file_hash,
        judge_file_name: d.judge_file_name,
        judge_file_hash: d.judge_file_hash,
      };
    };

    const taskdto: TaskBatchDTO = {
      type: task.type as TaskType.Batch,
      id: task.id,
      score_max: task.score_max,
      slug: task.slug,
      title: task.title,
      description: task.description,
      statement: task.statement,
      is_public: task.is_public,
      time_limit_ms: task.time_limit_ms,
      memory_limit_byte: task.memory_limit_byte,
      compile_time_limit_ms: task.compile_time_limit_ms,
      compile_memory_limit_byte: task.compile_memory_limit_byte,
      submission_size_limit_byte: task.submission_size_limit_byte,
      checker_kind: task.checker_kind,
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
        data: data.filter((d) => d.subtask_id === sub.id).map(toTaskDataBatchDTO),
      })),
    };
    return taskdto;
  } else if (task.type === TaskType.OutputOnly) {
    const toTaskDataOutputDTO = (d: (typeof data)[number]): TaskDataOutputDTO => {
      return {
        id: d.id,
        name: d.name,
        output_file_name: d.output_file_name,
        output_file_hash: d.output_file_hash,
        judge_file_name: d.judge_file_name,
        judge_file_hash: d.judge_file_hash,
      };
    };

    const taskdto: TaskOutputDTO = {
      type: task.type as TaskType.OutputOnly,
      id: task.id,
      score_max: task.score_max,
      slug: task.slug,
      title: task.title,
      description: task.description,
      statement: task.statement,
      is_public: task.is_public,
      submission_size_limit_byte: task.submission_size_limit_byte,
      checker_kind: task.checker_kind,
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
        data: data.filter((d) => d.subtask_id === sub.id).map(toTaskDataOutputDTO),
      })),
    };

    return taskdto;
  } else if (task.type === TaskType.Communication) {
    throw new NotYetImplementedError(task.type);
  } else {
    throw new UnreachableError(task.type);
  }
}
