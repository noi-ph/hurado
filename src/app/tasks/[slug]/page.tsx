import { notFound } from "next/navigation";
import { TaskViewerDTO } from "common/types";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { TaskViewer } from "client/components/task_viewer/task_viewer";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { TaskFlavor, TaskType } from "common/types/constants";
import { UnreachableError } from "common/errors";

async function getTaskData(slug: string): Promise<TaskViewerDTO | null> {
  return db.transaction().execute(async (trx) => {
    const task = await trx
      .selectFrom("tasks")
      .select(["id", "slug", "title", "description", "statement", "score_max", "type", "flavor"])
      .where("slug", "=", slug)
      .executeTakeFirst();

    if (task == null) {
      return null;
    }

    const credits = await trx
      .selectFrom("task_credits")
      .select(["name", "role"])
      .orderBy("order")
      .where("task_id", "=", task.id)
      .execute();

    if (task.type === TaskType.Batch) {
      return {
        id: task.id,
        slug: task.slug,
        title: task.title,
        description: task.description,
        statement: task.statement,
        score_max: task.score_max,
        credits: credits,
        type: task.type,
      };
    } else if (task.type === TaskType.Communication) {
      return {
        id: task.id,
        slug: task.slug,
        title: task.title,
        description: task.description,
        statement: task.statement,
        score_max: task.score_max,
        credits: credits,
        type: task.type,
      };
    } else if (task.type === TaskType.OutputOnly) {
      const subtasks = await trx
        .selectFrom("task_subtasks")
        .select(["name", "order", "score_max"])
        .orderBy("order")
        .where("task_id", "=", task.id)
        .execute();
      return {
        id: task.id,
        slug: task.slug,
        title: task.title,
        description: task.description,
        statement: task.statement,
        score_max: task.score_max,
        credits: credits,
        type: task.type,
        flavor: task.flavor as TaskFlavor,
        subtasks,
      };
    } else {
      throw new UnreachableError(task.type);
    }
  });
}

type TaskPageProps = {
  params: {
    slug: string;
  };
};

async function Page(props: TaskPageProps) {
  const task = await getTaskData(props.params.slug);

  if (task == null) {
    return notFound();
  }

  const session = getSession();
  const canEdit = canManageTasks(session);
  return (
    <DefaultLayout>
      <TaskViewer task={task} canEdit={canEdit} />
    </DefaultLayout>
  );
}

export default Page;
