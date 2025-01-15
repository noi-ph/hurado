import { db } from "db";
import { TaskBatchDTO, TaskCommunicationDTO, TaskDTO, TaskOutputDTO } from "common/validation/task_validation";
import { TaskFlavor, TaskFlavorOutput, TaskType } from "common/types/constants";
import { UnreachableError } from "common/errors";
import { dbToTaskDataBatchDTO, dbToTaskDataCommunicationDTO, dbToTaskDataOutputDTO } from "./editor_utils";

export async function getEditorTask(uuid: string): Promise<TaskDTO | null> {
  const task = await db
    .selectFrom("tasks")
    .select([
      "id",
      "title",
      "slug",
      "description",
      "statement",
      "type",
      "flavor",
      "score_max",
      "checker_kind",
      "checker_id",
      "communicator_id",
      "is_public",
      "time_limit_ms",
      "memory_limit_byte",
      "compile_time_limit_ms",
      "compile_memory_limit_byte",
      "submission_size_limit_byte",
    ])
    .where("id", "=", uuid)
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

  const scripts = await db
    .selectFrom("task_scripts")
    .select(["id", "file_name", "file_hash", "language", "argv"])
    .where("task_id", "=", task.id)
    .execute();

  const subtasks = await db
    .selectFrom("task_subtasks")
    .select(["id", "name", "order", "score_max"])
    .where("task_id", "=", task.id)
    .orderBy("order")
    .execute();

  const sample_IO = await db
    .selectFrom("task_sample_io")
    .select(["id", "order", "input", "output", "explanation"])
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
            "input_file_name",
            "input_file_hash",
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
      checker_file_name: scripts.find(s => s.id === task.checker_id)?.file_name,
      scripts: scripts.map((script) => ({
        id: script.id,
        file_name: script.file_name,
        file_hash: script.file_hash,
        language: script.language,
        argv: script.argv ?? undefined,
      })),
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
        data: data.filter((d) => d.subtask_id === sub.id).map(dbToTaskDataBatchDTO),
      })),
      sample_IO: sample_IO.map((io) => ({
        id: io.id,
        input: io.input,
        output: io.output,
        explanation: io.explanation,
      })),
    };
    return taskdto;
  } else if (task.type === TaskType.OutputOnly) {
    const taskdto: TaskOutputDTO = {
      type: task.type as TaskType.OutputOnly,
      flavor: task.flavor ?? (TaskFlavor.OutputText as TaskFlavorOutput),
      id: task.id,
      score_max: task.score_max,
      slug: task.slug,
      title: task.title,
      description: task.description,
      statement: task.statement,
      is_public: task.is_public,
      submission_size_limit_byte: task.submission_size_limit_byte,
      checker_kind: task.checker_kind,
      checker_file_name: scripts.find(s => s.id === task.checker_id)?.file_name,
      scripts: scripts.map((script) => ({
        id: script.id,
        file_name: script.file_name,
        file_hash: script.file_hash,
        language: script.language,
        argv: script.argv ?? undefined,
      })),
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
        data: data.filter((d) => d.subtask_id === sub.id).map(dbToTaskDataOutputDTO),
      })),
      sample_IO: sample_IO.map((io) => ({
        id: io.id,
        input: io.input,
        output: io.output,
        explanation: io.explanation,
      })),
    };

    return taskdto;
  } else if (task.type === TaskType.Communication) {
    const taskdto: TaskCommunicationDTO = {
      type: task.type as TaskType.Communication,
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
      checker_file_name: scripts.find(s => s.id === task.checker_id)?.file_name,
      communicator_file_name: scripts.find(s => s.id === task.communicator_id)?.file_name ?? '',
      scripts: scripts.map((script) => ({
        id: script.id,
        file_name: script.file_name,
        file_hash: script.file_hash,
        language: script.language,
        argv: script.argv ?? undefined,
      })),
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
        data: data.filter((d) => d.subtask_id === sub.id).map(dbToTaskDataCommunicationDTO),
      })),
      sample_IO: sample_IO.map((io) => ({
        id: io.id,
        input: io.input,
        output: io.output,
        explanation: io.explanation,
      })),
    };

    return taskdto;
  } else {
    throw new UnreachableError(task.type);
  }
}
