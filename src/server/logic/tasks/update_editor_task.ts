import { Selectable, Transaction } from "kysely";
import { db } from "db";
import {
  Models,
  TaskAttachmentTable,
  TaskCreditTable,
  TaskDataTable,
  TaskSampleIOTable,
  TaskScriptTable,
  TaskSubtaskTable,
} from "common/types";
import {
  TaskAttachmentDTO,
  TaskBatchDTO,
  TaskCommunicationDTO,
  TaskCreditDTO,
  TaskDataDTO,
  TaskDTO,
  TaskOutputDTO,
  TaskSampleIO_DTO,
  TaskScriptDTO,
  TaskSubtaskDTO,
} from "common/validation/task_validation";
import { normalizeAttachmentPath } from "common/utils/attachments";
import { JudgeLanguage, TaskFlavorOutput, TaskType } from "common/types/constants";
import { UnreachableError } from "common/errors";
import {
  dbToTaskDataBatchDTO,
  dbToTaskDataCommunicationDTO,
  dbToTaskDataOutputDTO,
} from "./editor_utils";


type Ordered<T> = T & {
  order: number;
};

function makeOrdered<T>(arr: T[]): Ordered<T>[] {
  return arr.map((obj, index) => ({
    ...obj,
    order: index + 1,
  }));
}

async function upsertTaskCredits(
  trx: Transaction<Models>,
  taskId: string,
  credits: TaskCreditDTO[]
): Promise<Selectable<TaskCreditTable>[]> {
  const creditsOrdered = makeOrdered(credits);
  const creditsNew = creditsOrdered.filter((credit) => credit.id == null);
  const creditsOld = creditsOrdered.filter((credit) => credit.id != null);

  const creditsOldIds = creditsOld.map((credit) => credit.id as string);
  if (creditsOldIds.length <= 0) {
    await trx.deleteFrom("task_credits").where("task_id", "=", taskId).execute();
  } else {
    await trx
      .deleteFrom("task_credits")
      .where("task_id", "=", taskId)
      .where("id", "not in", creditsOldIds)
      .execute();
  }

  const dbCreditsNew =
    creditsNew.length <= 0
      ? []
      : await trx
          .insertInto("task_credits")
          .values(
            creditsNew.map((credit) => ({
              name: credit.name,
              role: credit.role,
              order: credit.order,
              task_id: taskId,
            }))
          )
          .returningAll()
          .execute();

  const dbCreditsUpdate =
    creditsOld.length <= 0
      ? []
      : await trx
          .insertInto("task_credits")
          .values(
            creditsOld.map((credit) => ({
              id: credit.id,
              name: credit.name,
              role: credit.role,
              order: credit.order,
              task_id: taskId,
            }))
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              name: eb.ref("excluded.name"),
              role: eb.ref("excluded.role"),
              order: eb.ref("excluded.order"),
              task_id: eb.ref("excluded.task_id"),
            }))
          )
          .returningAll()
          .execute();

  return [...dbCreditsNew, ...dbCreditsUpdate];
}

async function upsertTaskScripts(
  trx: Transaction<Models>,
  taskId: string,
  scripts: TaskScriptDTO[]
): Promise<Selectable<TaskScriptTable>[]> {
  const scriptsNew = scripts.filter((script) => script.id == null);
  const scriptsOld = scripts.filter((script) => script.id != null);

  const dbScriptsNew =
    scriptsNew.length <= 0
      ? []
      : await trx
          .insertInto("task_scripts")
          .values(
            scriptsNew.map((script) => ({
              task_id: taskId,
              file_name: script.file_name,
              file_hash: script.file_hash,
              language: script.language as JudgeLanguage,
              argv: script.argv,
            }))
          )
          .returningAll()
          .execute();

  const dbScriptsUpdate =
    scriptsOld.length <= 0
      ? []
      : await trx
          .insertInto("task_scripts")
          .values(
            scriptsOld.map((script) => ({
              task_id: taskId,
              file_name: script.file_name,
              file_hash: script.file_hash,
              language: script.language as JudgeLanguage,
              argv: script.argv,
            }))
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              task_id: eb.ref("excluded.task_id"),
              file_name: eb.ref("excluded.file_name"),
              file_hash: eb.ref("excluded.file_hash"),
              language: eb.ref("excluded.language"),
              argv: eb.ref("excluded.argv"),
            }))
          )
          .returningAll()
          .execute();

  return [...dbScriptsNew, ...dbScriptsUpdate];
}

async function upsertTaskAttachments(
  trx: Transaction<Models>,
  taskId: string,
  attachments: TaskAttachmentDTO[]
): Promise<Selectable<TaskAttachmentTable>[]> {
  const attachmentsNew = attachments.filter((attachment) => attachment.id == null);
  const attachmentsOld = attachments.filter((attachment) => attachment.id != null);

  const attachmentsOldIds = attachmentsOld.map((attachment) => attachment.id as string);
  if (attachmentsOldIds.length <= 0) {
    await trx.deleteFrom("task_attachments").where("task_id", "=", taskId).execute();
  } else {
    await trx
      .deleteFrom("task_attachments")
      .where("task_id", "=", taskId)
      .where("id", "not in", attachmentsOldIds)
      .execute();
  }

  const dbAttachmentsNew =
    attachmentsNew.length <= 0
      ? []
      : await trx
          .insertInto("task_attachments")
          .values(
            attachmentsNew.map((attach) => ({
              path: normalizeAttachmentPath(attach.path),
              mime_type: attach.mime_type,
              file_hash: attach.file_hash,
              task_id: taskId,
            }))
          )
          .returningAll()
          .execute();

  const dbAttachmentsUpdate =
    attachmentsOld.length <= 0
      ? []
      : await trx
          .insertInto("task_attachments")
          .values(
            attachmentsOld.map((attach) => ({
              id: attach.id,
              path: attach.path,
              mime_type: attach.mime_type,
              file_hash: attach.file_hash,
              task_id: taskId,
            }))
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              path: eb.ref("excluded.path"),
              mime_type: eb.ref("excluded.mime_type"),
              file_hash: eb.ref("excluded.file_hash"),
              task_id: eb.ref("excluded.task_id"),
            }))
          )
          .returningAll()
          .execute();

  return [...dbAttachmentsNew, ...dbAttachmentsUpdate];
}

type UpsertTaskSubtasksResult = {
  subtasks: Selectable<TaskSubtaskTable>[];
  subtasksWithData: TaskSubtaskWithData[];
};

export async function upsertTaskSubtasks(
  trx: Transaction<Models>,
  taskId: string,
  subtasks: TaskSubtaskDTO[]
): Promise<UpsertTaskSubtasksResult> {
  const subtasksOrdered = makeOrdered(subtasks);
  const subtasksNew = subtasksOrdered.filter((subtask) => subtask.id == null);
  const subtasksOld = subtasksOrdered.filter((subtask) => subtask.id != null);

  const subtasksOldIds = subtasksOld.map((subtask) => subtask.id as string);
  if (subtasksOldIds.length <= 0) {
    await trx.deleteFrom("task_subtasks").where("task_id", "=", taskId).execute();
  } else {
    await trx
      .deleteFrom("task_subtasks")
      .where("task_id", "=", taskId)
      .where("id", "not in", subtasksOldIds)
      .execute();
  }

  const dbSubtasksNew =
    subtasksNew.length <= 0
      ? []
      : await trx
          .insertInto("task_subtasks")
          .values(
            subtasksNew.map((subtask) => ({
              name: subtask.name,
              order: subtask.order,
              score_max: subtask.score_max,
              task_id: taskId,
            }))
          )
          .returningAll()
          .execute();

  const dbSubtasksOld =
    subtasksOld.length <= 0
      ? []
      : await trx
          .insertInto("task_subtasks")
          .values(
            subtasksOld.map((subtask) => ({
              id: subtask.id,
              name: subtask.name,
              order: subtask.order,
              score_max: subtask.score_max,
              task_id: taskId,
            }))
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              name: eb.ref("excluded.name"),
              order: eb.ref("excluded.order"),
              score_max: eb.ref("excluded.score_max"),
              task_id: eb.ref("excluded.task_id"),
            }))
          )
          .returningAll()
          .execute();

  const dataWithSubtaskIds: TaskSubtaskWithData[] = [];
  // Just mutate these guys in place!
  for (let i = 0; i < subtasksNew.length; i++) {
    const dto = subtasksNew[i];
    const dbs = dbSubtasksNew[i];
    dataWithSubtaskIds.push({
      id: dbs.id,
      data: dto.data,
    });
  }
  for (let i = 0; i < subtasksOld.length; i++) {
    const dto = subtasksOld[i];
    dataWithSubtaskIds.push({
      id: dto.id as string,
      data: dto.data,
    });
  }

  return {
    subtasks: [...dbSubtasksNew, ...dbSubtasksOld],
    subtasksWithData: dataWithSubtaskIds,
  };
}

type TaskSampleWithExtras = TaskSampleIO_DTO & {
  order: number;
};

async function upsertTaskSampleIO(
  trx: Transaction<Models>,
  taskId: string,
  _sample_IO: TaskSampleIO_DTO[],
): Promise<Selectable<TaskSampleIOTable>[]> {
  const sample_IO: TaskSampleWithExtras[] = _sample_IO.map((sample, idx) => ({
    ...sample,
    order: idx,
  }));
  const samplesNew = sample_IO.filter((sample) => sample.id == null);
  const samplesOld = sample_IO.filter((sample) => sample.id != null);

  const samplesOldIds = samplesOld.map((sample) => sample.id as string);
  if (samplesOldIds.length <= 0) {
    await trx.deleteFrom("task_sample_io").where("task_id", "=", taskId).execute();
  } else {
    await trx
      .deleteFrom("task_sample_io")
      .where("task_id", "=", taskId)
      .where("id", "not in", samplesOldIds)
      .execute();
  }

  const dbSamplesNew =
    samplesNew.length <= 0
      ? []
      : await trx
        .insertInto("task_sample_io")
        .values(
          samplesNew.map((sample) => ({
            task_id: taskId,
            order: sample.order,
            input: sample.input,
            output: sample.output,
            explanation: sample.explanation,
          }))
        )
        .returningAll()
        .execute();

  const dbSamplesUpdate =
    samplesOld.length <= 0
      ? []
      : await trx
          .insertInto("task_sample_io")
          .values(
            samplesOld.map((sample) => ({
              id: sample.id,
              task_id: taskId,
              order: sample.order,
              input: sample.input,
              output: sample.output,
              explanation: sample.explanation,
            }))
          )
          .onConflict((oc) => 
            oc.column("id").doUpdateSet((eb) => ({
              task_id: eb.ref("excluded.task_id"),
              order: eb.ref("excluded.order"),
              input: eb.ref("excluded.input"),
              output: eb.ref("excluded.output"),
              explanation: eb.ref("excluded.explanation"),
            }))
          )
          .returningAll()
          .execute();

  const dbSamples = [...dbSamplesNew, ...dbSamplesUpdate];
  dbSamples.sort((a, b) => a.order - b.order );
  return dbSamples;
}

type TaskSubtaskWithData = {
  id: string;
  data: TaskDataDTO[];
};

type TaskDataWithExtras = TaskDataDTO & {
  subtask_id: string;
  order: number;
};

export async function upsertTaskData(
  trx: Transaction<Models>,
  subtasks: TaskSubtaskWithData[]
): Promise<Selectable<TaskDataTable>[]> {
  const dataAll: TaskDataWithExtras[] = subtasks.flatMap((sub) => {
    return sub.data.map((d, index) => ({
      ...d,
      subtask_id: sub.id,
      order: index + 1,
    }));
  });
  const dataNew = dataAll.filter((d) => d.id == null);
  const dataOld = dataAll.filter((d) => d.id != null);

  const subtaskIds = subtasks.map((subtask) => subtask.id);
  if (subtaskIds.length > 0) {
    const dataOldIds = dataOld.map((data) => data.id as string);
    if (dataOldIds.length <= 0) {
      await trx.deleteFrom("task_data").where("subtask_id", "in", subtaskIds).execute();
    } else {
      await trx
        .deleteFrom("task_data")
        .where("subtask_id", "in", subtaskIds)
        .where("id", "not in", dataOldIds)
        .execute();
    }
  }

  const dbDataNew =
    dataNew.length <= 0
      ? []
      : await trx
          .insertInto("task_data")
          .values(
            dataNew.map((data, index) => ({
              name: data.name,
              order: data.order,
              input_file_hash: "input_file_hash" in data ? data.input_file_hash : null,
              input_file_name: "input_file_name" in data ? data.input_file_name : null,
              judge_file_hash: data.judge_file_hash,
              judge_file_name: data.judge_file_name,
              subtask_id: data.subtask_id,
            }))
          )
          .returningAll()
          .execute();

  const dbDataOld =
    dataOld.length <= 0
      ? []
      : await trx
          .insertInto("task_data")
          .values(
            dataOld.map((data) => ({
              id: data.id,
              name: data.name,
              order: data.order,
              input_file_hash: "input_file_hash" in data ? data.input_file_hash : null,
              input_file_name: "input_file_name" in data ? data.input_file_name : null,
              judge_file_hash: data.judge_file_hash,
              judge_file_name: data.judge_file_name,
              subtask_id: data.subtask_id,
            }))
          )
          .onConflict((oc) =>
            oc.column("id").doUpdateSet((eb) => ({
              name: eb.ref("excluded.name"),
              order: eb.ref("excluded.order"),
              input_file_hash: eb.ref("excluded.input_file_hash"),
              input_file_name: eb.ref("excluded.input_file_name"),
              judge_file_hash: eb.ref("excluded.judge_file_hash"),
              judge_file_name: eb.ref("excluded.judge_file_name"),
              subtask_id: eb.ref("excluded.subtask_id"),
            }))
          )
          .returningAll()
          .execute();

  return [...dbDataNew, ...dbDataOld];
}

export async function updateEditorTask(task: TaskDTO): Promise<TaskDTO> {
  return db.transaction().execute(async (trx): Promise<TaskDTO> => {
    const dbTaskScripts = await upsertTaskScripts(trx, task.id, task.scripts);
    const scriptNameToId = new Map(dbTaskScripts.map((s) => [s.file_name, s.id]));
    const scriptIdToName = new Map(dbTaskScripts.map((s) => [s.id, s.file_name]));

    function getScriptFilename(id: string | null, required: true): string;
    function getScriptFilename(id: string | null, required: false): string | undefined;
    function getScriptFilename(id: string | null, required: boolean): string | undefined {
      if (required) {
        if (id == null) {
          throw new Error("Missing script file id");
        }
        const filename = scriptIdToName.get(id);
        if (filename == null) {
          throw new Error(`Missing script id ${id}`);
        }
        return filename;
      } else {
        if (id == null) {
          return undefined;
        }
        return scriptIdToName.get(id);
      }
    }

    function getScriptId(filename: string | undefined, required: true): string;
    function getScriptId(filename: string | undefined, required: false): string | undefined;
    function getScriptId(filename: string | undefined, required: boolean): string | undefined {
      if (required) {
        if (filename == null) {
          throw new Error("Missing script file name");
        }
        const scriptId = scriptNameToId.get(filename);
        if (scriptId == null) {
          throw new Error(`Missing script file name ${filename}`);
        }
        return scriptId;
      } else {
        if (filename == null) {
          return undefined;
        }
        return scriptNameToId.get(filename);
      }
    }

    const dbTask = await trx
      .updateTable("tasks")
      .set({
        slug: task.slug,
        title: task.title,
        description: task.description ?? undefined,
        statement: task.statement,
        score_max: task.score_max,
        type: task.type,
        checker_kind: task.checker_kind,
        checker_id: getScriptId(task.checker_file_name, false),
        communicator_id:
          task.type === TaskType.Communication
            ? getScriptId(task.communicator_file_name, true)
            : null,
        flavor: "flavor" in task ? task.flavor : null,
        time_limit_ms: "time_limit_ms" in task ? task.time_limit_ms : null,
        memory_limit_byte: "memory_limit_byte" in task ? task.memory_limit_byte : null,
        compile_time_limit_ms: "compile_time_limit_ms" in task ? task.compile_time_limit_ms : null,
        compile_memory_limit_byte:
          "compile_memory_limit_byte" in task ? task.compile_memory_limit_byte : null,
        submission_size_limit_byte:
          "submission_size_limit_byte" in task ? task.submission_size_limit_byte : null,
      })
      .where("id", "=", task.id)
      .returning([
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
      .executeTakeFirstOrThrow();

    const dbTaskCredits = await upsertTaskCredits(trx, task.id, task.credits);
    const dbTaskAttachments = await upsertTaskAttachments(trx, task.id, task.attachments);
    const { subtasks: dbSubtasks, subtasksWithData } = await upsertTaskSubtasks(
      trx,
      task.id,
      task.subtasks
    );
    let dbSampleIO = await upsertTaskSampleIO(trx, task.id, task.sample_IO);
    const dbTaskData = await upsertTaskData(trx, subtasksWithData);

    const currentScriptIds = dbTaskScripts.map((script) => script.id);
    if (currentScriptIds.length <= 0) {
      await trx.deleteFrom("task_scripts").where("task_id", "=", task.id).execute();
    } else {
      await trx
        .deleteFrom("task_scripts")
        .where("task_id", "=", task.id)
        .where("id", "not in", currentScriptIds)
        .execute();
    }
  
    if (dbTask.type === TaskType.Batch) {
      const result: TaskBatchDTO = {
        type: dbTask.type as TaskType.Batch,
        id: dbTask.id,
        score_max: dbTask.score_max,
        slug: dbTask.slug,
        title: dbTask.title,
        description: dbTask.description,
        statement: dbTask.statement,
        is_public: dbTask.is_public,
        time_limit_ms: dbTask.time_limit_ms,
        memory_limit_byte: dbTask.memory_limit_byte,
        compile_time_limit_ms: dbTask.compile_time_limit_ms,
        compile_memory_limit_byte: dbTask.compile_memory_limit_byte,
        submission_size_limit_byte: dbTask.submission_size_limit_byte,
        checker_kind: dbTask.checker_kind,
        checker_file_name: getScriptFilename(dbTask.checker_id, false),
        credits: dbTaskCredits.map((cred) => ({
          id: cred.id,
          name: cred.name,
          role: cred.role,
        })),
        attachments: dbTaskAttachments.map((att) => ({
          id: att.id,
          path: att.path,
          file_hash: att.file_hash,
          mime_type: att.mime_type,
        })),
        subtasks: dbSubtasks.map((sub) => ({
          id: sub.id,
          name: sub.name,
          score_max: sub.score_max,
          data: dbTaskData.filter((d) => d.subtask_id === sub.id).map(dbToTaskDataBatchDTO),
        })),
        scripts: dbTaskScripts.map((script) => ({
          file_name: script.file_name,
          file_hash: script.file_hash,
          language: script.language,
          argv: script.argv ?? undefined,
        })),
        sample_IO: dbSampleIO.map((sample) => ({
          id: sample.id,
          input: sample.input,
          output: sample.output,
          explanation: sample.explanation,
        })),
      };
      return result;
    } else if (dbTask.type === TaskType.Communication) {
      const result: TaskCommunicationDTO = {
        type: dbTask.type as TaskType.Communication,
        id: dbTask.id,
        score_max: dbTask.score_max,
        slug: dbTask.slug,
        title: dbTask.title,
        description: dbTask.description,
        statement: dbTask.statement,
        is_public: dbTask.is_public,
        time_limit_ms: dbTask.time_limit_ms,
        memory_limit_byte: dbTask.memory_limit_byte,
        compile_time_limit_ms: dbTask.compile_time_limit_ms,
        compile_memory_limit_byte: dbTask.compile_memory_limit_byte,
        submission_size_limit_byte: dbTask.submission_size_limit_byte,
        checker_kind: dbTask.checker_kind,
        checker_file_name: getScriptFilename(dbTask.checker_id, false),
        communicator_file_name: getScriptFilename(dbTask.communicator_id, true),
        credits: dbTaskCredits.map((cred) => ({
          id: cred.id,
          name: cred.name,
          role: cred.role,
        })),
        attachments: dbTaskAttachments.map((att) => ({
          id: att.id,
          path: att.path,
          file_hash: att.file_hash,
          mime_type: att.mime_type,
        })),
        subtasks: dbSubtasks.map((sub) => ({
          id: sub.id,
          name: sub.name,
          score_max: sub.score_max,
          data: dbTaskData.filter((d) => d.subtask_id === sub.id).map(dbToTaskDataCommunicationDTO),
        })),
        scripts: dbTaskScripts.map((script) => ({
          file_name: script.file_name,
          file_hash: script.file_hash,
          language: script.language,
          argv: script.argv ?? undefined,
        })),
        sample_IO: dbSampleIO.map((sample) => ({
          id: sample.id,
          input: sample.input,
          output: sample.output,
          explanation: sample.explanation,
        })),
      };
      return result;
    } else if (dbTask.type === TaskType.OutputOnly) {
      const result: TaskOutputDTO = {
        type: dbTask.type as TaskType.OutputOnly,
        flavor: dbTask.flavor as TaskFlavorOutput,
        id: dbTask.id,
        score_max: dbTask.score_max,
        slug: dbTask.slug,
        title: dbTask.title,
        description: dbTask.description,
        statement: dbTask.statement,
        is_public: dbTask.is_public,
        submission_size_limit_byte: dbTask.submission_size_limit_byte,
        checker_kind: dbTask.checker_kind,
        checker_file_name: getScriptFilename(dbTask.checker_id, false),
        credits: dbTaskCredits.map((cred) => ({
          id: cred.id,
          name: cred.name,
          role: cred.role,
        })),
        attachments: dbTaskAttachments.map((att) => ({
          id: att.id,
          path: att.path,
          file_hash: att.file_hash,
          mime_type: att.mime_type,
        })),
        subtasks: dbSubtasks.map((sub) => ({
          id: sub.id,
          name: sub.name,
          score_max: sub.score_max,
          data: dbTaskData.filter((d) => d.subtask_id === sub.id).map(dbToTaskDataOutputDTO),
        })),
        scripts: dbTaskScripts.map((script) => ({
          file_name: script.file_name,
          file_hash: script.file_hash,
          language: script.language,
          argv: script.argv ?? undefined,
        })),
        sample_IO: dbSampleIO.map((sample) => ({
          id: sample.id,
          input: sample.input,
          output: sample.output,
          explanation: sample.explanation,
        })),
      };
      return result;
    } else {
      throw new UnreachableError(dbTask.type);
    }
  });
}
