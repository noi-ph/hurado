import { db } from "db";
import {
  SubmissionViewerDTO,
  UserPublic,
  VerdictSubtaskViewerDTO,
  VerdictTaskDataViewerDTO,
  VerdictViewerDTO,
} from "common/types";
import { checkUUIDv4 } from "common/utils/uuid";
import { SubmissionFileStorage } from "server/files";
import { Language, Verdict } from "common/types/constants";
import { notNull } from "common/utils/guards";

export async function getSubmissionViewerDTO(id: string, user: UserPublic): Promise<SubmissionViewerDTO | null> {
  const sub = await db
    .selectFrom("submissions")
    .where("submissions.id", "=", checkUUIDv4(id))
    .where("submissions.user_id", "=", user.id)
    .leftJoin("tasks", "tasks.id", "submissions.task_id")
    .select([
      "submissions.id",
      "submissions.language",
      "submissions.created_at",
      "submissions.file_hash",
      "submissions.task_id",
      "submissions.official_verdict_id",
      "tasks.slug",
      "tasks.title",
    ])
    .orderBy("submissions.created_at", "desc")
    .executeTakeFirst();

  if (sub == null) {
    return null;
  }

  const [code, verdict] = await Promise.all([
    getSubmissionCode(sub.file_hash),
    getSubmissionVerdict(sub.official_verdict_id, sub.task_id),
  ]);

  return {
    id: sub.id,
    language: sub.language as Language,
    code: code,
    created_at: sub.created_at,
    verdict: verdict,
    task_id: sub.task_id,
    task_slug: sub.slug ?? sub.task_id,
    task_title: sub.title ?? sub.task_id,
  };
}

async function getSubmissionCode(hash: string): Promise<string> {
  const client = SubmissionFileStorage.getBlobClient(hash);
  const buffer = await client.downloadToBuffer();
  return buffer.toString("utf8");
}

async function getSubmissionVerdict(
  verdict_id: string | null,
  task_id: string
): Promise<VerdictViewerDTO | null> {
  if (verdict_id == null) {
    return null;
  }

  const verdict = await db
    .selectFrom("verdicts")
    .where("id", "=", verdict_id)
    .select([
      "id",
      "verdict",
      "raw_score",
      "running_time_ms",
      "running_memory_byte",
      "compile_time_ms",
      "compile_memory_byte",
    ])
    .executeTakeFirstOrThrow();

  const task = await db
    .selectFrom("tasks")
    .where("id", "=", task_id)
    .select(["score_max"])
    .executeTakeFirstOrThrow();

  const subverdicts = await db
    .selectFrom("task_subtasks")
    .where("task_id", "=", task_id)
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("verdict_subtasks")
          .select([
            "id",
            "subtask_id",
            "verdict",
            "raw_score",
            "running_time_ms",
            "running_memory_byte",
          ])
          .where("verdict_id", "=", verdict.id)
          .as("verdict_subtasks"),
      (join) => join.onRef("verdict_subtasks.subtask_id", "=", "task_subtasks.id")
    )
    .select([
      "task_subtasks.id as subtask_id",
      "task_subtasks.score_max",
      "verdict_subtasks.id as verdict_subtask_id",
      "verdict_subtasks.verdict",
      "verdict_subtasks.raw_score",
      "verdict_subtasks.running_time_ms",
      "verdict_subtasks.running_memory_byte",
    ])
    .orderBy("task_subtasks.order", "asc")
    .execute();

  const subtaskIds = subverdicts.map((sv) => sv.subtask_id);
  const verdictSubtaskIds = subverdicts.map((sv) => sv.verdict_subtask_id).filter(notNull);

  const dataVerdictsQuery = db
    .selectFrom("task_data")
    .where("task_data.subtask_id", "in", subtaskIds)
    .leftJoin(
      (eb) => {
        const base = eb
          .selectFrom("verdict_task_data")
          .select([
            "id",
            "task_data_id",
            "verdict",
            "raw_score",
            "running_time_ms",
            "running_memory_byte",
          ]);
        const filtered =
          verdictSubtaskIds.length > 0
            ? base.where("verdict_subtask_id", "in", verdictSubtaskIds)
            : base.where("verdict_subtask_id", "is", null);
        return filtered.as("verdict_task_data");
      },
      (join) => join.onRef("verdict_task_data.task_data_id", "=", "task_data.id")
    )
    .select([
      "task_data.subtask_id as subtask_id",
      "verdict_task_data.id as verdict_task_data_id",
      "verdict_task_data.verdict",
      "verdict_task_data.raw_score",
      "verdict_task_data.running_time_ms",
      "verdict_task_data.running_memory_byte",
    ])
    .orderBy(["task_data.subtask_id", "task_data.order asc"]);

  const dataVerdicts =
    subtaskIds.length >= 0 && verdictSubtaskIds.length >= 0
      ? await dataVerdictsQuery.execute()
      : [];

  function toVerdictTaskData(dv: (typeof dataVerdicts)[number]): VerdictTaskDataViewerDTO {
    return {
      verdict: dv.verdict as Verdict,
      raw_score: dv.raw_score,
      running_time_ms: dv.running_time_ms,
      running_memory_byte: dv.running_memory_byte,
    };
  }

  function toVerdictSubtask(sv: (typeof subverdicts)[number]): VerdictSubtaskViewerDTO {
    return {
      verdict: sv.verdict,
      raw_score: sv.raw_score,
      max_score: sv.score_max,
      running_time_ms: sv.running_time_ms,
      running_memory_byte: sv.running_memory_byte,
      data: dataVerdicts.filter((dv) => dv.subtask_id === sv.subtask_id).map(toVerdictTaskData),
    };
  }

  return {
    verdict: verdict.verdict as Verdict,
    raw_score: verdict.raw_score,
    max_score: task.score_max,
    running_time_ms: verdict.running_time_ms,
    running_memory_byte: verdict.running_memory_byte,
    compile_time_ms: verdict.compile_time_ms,
    compile_memory_byte: verdict.compile_memory_byte,
    subtasks: subverdicts.map(toVerdictSubtask),
  };
}
