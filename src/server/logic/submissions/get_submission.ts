import { db } from "db";
import {
  SubmissionViewerDTO,
  SubmissionViewerFileDTO,
  UserPublic,
  VerdictSubtaskViewerDTO,
  VerdictTaskDataViewerDTO,
  VerdictViewerDTO,
} from "common/types";
import { checkUUIDv4 } from "common/utils/uuid";
import { SubmissionFileStorage } from "server/files";
import { Language, TaskType, Verdict } from "common/types/constants";
import { notNull } from "common/utils/guards";

export async function getSubmissionViewerDTO(
  id: string,
  user: UserPublic,
  isTaskManager: boolean
): Promise<SubmissionViewerDTO | null> {
  let query = db.selectFrom("submissions").where("submissions.id", "=", checkUUIDv4(id));

  if (!isTaskManager) {
    query = query.where("submissions.user_id", "=", user.id);
  }

  const sub = await query
    .leftJoin("tasks", "tasks.id", "submissions.task_id")
    .select([
      "submissions.id",
      "submissions.language",
      "submissions.created_at",
      "submissions.task_id",
      "submissions.official_verdict_id",
      "tasks.slug as task_slug",
      "tasks.title as task_title",
      "tasks.type as task_type",
    ])
    .orderBy("submissions.created_at", "desc")
    .executeTakeFirst();

  if (sub == null) {
    return null;
  }

  const [files, verdict] = await Promise.all([
    getSubmissionViewerFiles({
      type: sub.task_type,
      submission_id: sub.id,
      task_id: sub.task_id,
    }),
    getSubmissionVerdict(sub.official_verdict_id, sub.task_id),
  ]);

  return {
    id: sub.id,
    language: sub.language as Language,
    created_at: sub.created_at,
    verdict: verdict,
    files: files,
    task: {
      id: sub.task_id,
      slug: sub.task_slug as string,
      title: sub.task_title as string,
      type: sub.task_type as TaskType,
    },
  };
}

type SubmissionData = {
  type: TaskType | null;
  submission_id: string;
  task_id: string;
};

async function getSubmissionViewerFiles(data: SubmissionData): Promise<SubmissionViewerFileDTO[]> {
  if (data.type === TaskType.OutputOnly) {
    const files = await db
      .selectFrom("submission_files")
      .where("submission_files.submission_id", "=", data.submission_id)
      .innerJoin(
        (eb) =>
          eb
            .selectFrom("tasks")
            .where("tasks.id", "=", data.task_id)
            .innerJoin("task_subtasks", "task_subtasks.task_id", "tasks.id")
            .innerJoin("task_data", "task_data.subtask_id", "task_subtasks.id")
            .select(["task_data.judge_file_name", "task_subtasks.order as subtask_order"])
            .as("task_info"),
        (join) => join.onRef("task_info.judge_file_name", "=", "submission_files.file_name")
      )
      .select(["submission_files.hash", "task_info.subtask_order"])
      .execute();
    return Promise.all(files.map((f) => loadSubmissionViewerFile(f.hash, f.subtask_order)));
  } else {
    const file = await db
      .selectFrom("submission_files")
      .select(["hash"])
      .where("submission_id", "=", data.submission_id)
      .executeTakeFirst();
    if (file == null) {
      return [];
    }

    return Promise.all([loadSubmissionViewerFile(file.hash, null)]);
  }
}

async function loadSubmissionViewerFile(
  hash: string,
  subtask: number | null
): Promise<SubmissionViewerFileDTO> {
  let buffer: Buffer | null = null;
  try {
    buffer = await SubmissionFileStorage.downloadToBuffer(hash);
  } catch {
    // File does not exist
  }
  if (buffer == null) {
    return {
      subtask: subtask,
      hash: hash,
      content: null,
    };
  } else {
    const content = buffer.toString("utf8");
    return {
      subtask: subtask,
      hash: hash,
      content,
    };
  }
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
      "score_raw",
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
            "score_raw",
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
      "verdict_subtasks.score_raw",
      "verdict_subtasks.running_time_ms",
      "verdict_subtasks.running_memory_byte",
    ])
    .orderBy("task_subtasks.order", "asc")
    .execute();

  const subtaskIds = subverdicts.map((sv) => sv.subtask_id);
  const verdictSubtaskIds = subverdicts.map((sv) => sv.verdict_subtask_id).filter(notNull);

  if (subtaskIds.length == 0) {
    // No subtasks at all
    return {
      verdict: verdict.verdict as Verdict | null,
      score_raw: verdict.score_raw,
      score_max: task.score_max,
      running_time_ms: verdict.running_time_ms,
      running_memory_byte: verdict.running_memory_byte,
      compile_time_ms: verdict.compile_time_ms,
      compile_memory_byte: verdict.compile_memory_byte,
      subtasks: [],
    };
  } else if (verdictSubtaskIds.length == 0) {
    // Subtasks exist but subverdicts do not. Only need to query task_data
    // In fact, we really only need the counts per subtask_id
    const dataVerdictsQuery = db
      .selectFrom("task_data")
      .where("task_data.subtask_id", "in", subtaskIds)
      .select(["task_data.subtask_id as subtask_id"])
      .orderBy(["task_data.subtask_id"]);

    const dataVerdicts = await dataVerdictsQuery.execute();

    // No verdict subtask => no verdict task data => empty objects
    // eslint-disable-next-line no-inner-declarations -- pre-existing error before eslint inclusion
    function toVerdictTaskData(): VerdictTaskDataViewerDTO {
      return {
        verdict: null,
        score_raw: null,
        running_time_ms: null,
        running_memory_byte: null,
      };
    }

    // eslint-disable-next-line no-inner-declarations -- pre-existing error before eslint inclusion
    function toVerdictSubtask(sv: (typeof subverdicts)[number]): VerdictSubtaskViewerDTO {
      return {
        verdict: sv.verdict,
        score_raw: sv.score_raw,
        score_max: sv.score_max,
        running_time_ms: sv.running_time_ms,
        running_memory_byte: sv.running_memory_byte,
        data: dataVerdicts.filter((dv) => dv.subtask_id === sv.subtask_id).map(toVerdictTaskData),
      };
    }

    return {
      verdict: verdict.verdict as Verdict | null,
      score_raw: verdict.score_raw,
      score_max: task.score_max,
      running_time_ms: verdict.running_time_ms,
      running_memory_byte: verdict.running_memory_byte,
      compile_time_ms: verdict.compile_time_ms,
      compile_memory_byte: verdict.compile_memory_byte,
      subtasks: subverdicts.map(toVerdictSubtask),
    };
  } else {
    // Subtasks exist and at least one verdict subtask exists
    // We need to find all task_data and left join them to verdict_task_data
    const dataVerdictsQuery = db
      .selectFrom("task_data")
      .where("task_data.subtask_id", "in", subtaskIds)
      .leftJoin(
        (eb) => {
          return eb
            .selectFrom("verdict_task_data")
            .select([
              "id",
              "task_data_id",
              "verdict",
              "score_raw",
              "running_time_ms",
              "running_memory_byte",
            ])
            .where("verdict_subtask_id", "in", verdictSubtaskIds)
            .as("verdict_task_data");
        },
        (join) => join.onRef("verdict_task_data.task_data_id", "=", "task_data.id")
      )
      .select([
        "task_data.subtask_id as subtask_id",
        "verdict_task_data.id as verdict_task_data_id",
        "verdict_task_data.verdict",
        "verdict_task_data.score_raw",
        "verdict_task_data.running_time_ms",
        "verdict_task_data.running_memory_byte",
      ])
      .orderBy(["task_data.subtask_id", "task_data.order asc"]);

    const dataVerdicts = await dataVerdictsQuery.execute();
    // eslint-disable-next-line no-inner-declarations -- pre-existing error before eslint inclusion
    function toVerdictTaskData(dv: (typeof dataVerdicts)[number]): VerdictTaskDataViewerDTO {
      return {
        verdict: dv.verdict as Verdict,
        score_raw: dv.score_raw,
        running_time_ms: dv.running_time_ms,
        running_memory_byte: dv.running_memory_byte,
      };
    }

    // eslint-disable-next-line no-inner-declarations -- pre-existing error before eslint inclusion
    function toVerdictSubtask(sv: (typeof subverdicts)[number]): VerdictSubtaskViewerDTO {
      return {
        verdict: sv.verdict,
        score_raw: sv.score_raw,
        score_max: sv.score_max,
        running_time_ms: sv.running_time_ms,
        running_memory_byte: sv.running_memory_byte,
        data: dataVerdicts.filter((dv) => dv.subtask_id === sv.subtask_id).map(toVerdictTaskData),
      };
    }

    return {
      verdict: verdict.verdict as Verdict | null,
      score_raw: verdict.score_raw,
      score_max: task.score_max,
      running_time_ms: verdict.running_time_ms,
      running_memory_byte: verdict.running_memory_byte,
      compile_time_ms: verdict.compile_time_ms,
      compile_memory_byte: verdict.compile_memory_byte,
      subtasks: subverdicts.map(toVerdictSubtask),
    };
  }
}
