import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TaskType } from "common/types/constants";
import { REGEX_SLUG } from "common/validation/common_validation";
import {
  zTaskSubtaskBatch,
  zTaskSubtaskCommunication,
  zTaskSubtaskOutput,
} from "common/validation/task_validation";
import { db } from "db";
import { canManageTasks } from "server/authorization";
import { upsertTaskData, upsertTaskSubtasks } from "server/logic/tasks/update_editor_task";
import { getSession } from "server/sessions";

// Updates only a subset of the properties that kg knows about, and
//   DOESN'T OVERWRITE THE OTHER PROPERTIES!!!
export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 403 });
  }

  const data = await request.json();
  const parsed = zKgUpdateTaskSchema.safeParse(data);
  if (parsed.success) {
    const task = await updateKgTask(parsed.data);
    return NextResponse.json(task);
  } else {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
}

const zKgUpdateTaskCommon = {
  id: z.string().uuid(),
  slug: z.string().min(1).regex(REGEX_SLUG),
  title: z.string().min(1),
  is_public: z.boolean(),
  score_max: z.number().nonnegative(),
};

const zKgUpdateTaskTypeBatch = z.object({
  ...zKgUpdateTaskCommon,
  type: z.literal(TaskType.Batch),
  time_limit_ms: z.number().nonnegative().nullable(),
  subtasks: z.array(zTaskSubtaskBatch),
});

const zKgUpdateTaskTypeCommunication = z.object({
  ...zKgUpdateTaskCommon,
  type: z.literal(TaskType.Communication),
  time_limit_ms: z.number().nonnegative().nullable(),
  subtasks: z.array(zTaskSubtaskCommunication),
});

const zKgUpdateTaskTypeOutput = z.object({
  ...zKgUpdateTaskCommon,
  type: z.literal(TaskType.OutputOnly),
  subtasks: z.array(zTaskSubtaskOutput),
});

const zKgUpdateTaskSchema = z.discriminatedUnion("type", [
  zKgUpdateTaskTypeBatch,
  zKgUpdateTaskTypeOutput,
  zKgUpdateTaskTypeCommunication,
]);

type KgTaskDTO =
  | z.infer<typeof zKgUpdateTaskTypeBatch>
  | z.infer<typeof zKgUpdateTaskTypeCommunication>
  | z.infer<typeof zKgUpdateTaskTypeOutput>;

async function updateKgTask(task: KgTaskDTO) {
  return db.transaction().execute(async (trx) => {
    const dbTask = await trx
      .updateTable("tasks")
      .set({
        id: task.id,
        type: task.type,
        slug: task.slug,
        title: task.title,
        score_max: task.score_max,
        time_limit_ms: "time_limit_ms" in task ? task.time_limit_ms : null,
      })
      .where("id", "=", task.id)
      .returning(["id", "type", "slug", "title", "is_public", "score_max", "time_limit_ms"])
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    const { subtasks: dbSubtasks, subtasksWithData } = await upsertTaskSubtasks(
      trx,
      task.id,
      task.subtasks
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    const dbTaskData = await upsertTaskData(trx, subtasksWithData);

    return {
      id: dbTask.id,
      slug: dbTask.slug,
      title: dbTask.title,
    };
  });
}
