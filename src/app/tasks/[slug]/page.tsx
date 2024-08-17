import { notFound } from "next/navigation";
import { TaskViewerDTO } from "common/types";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { TaskViewer } from "client/components/task_viewer/task_viewer";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";

async function getTaskData(slug: string): Promise<TaskViewerDTO | null> {
  const task = await db
    .selectFrom("tasks")
    .select(["id", "slug", "title", "description", "statement", "score_max"])
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (task == null) {
    return null;
  }
  const credits = await db
    .selectFrom("task_credits")
    .select(["name", "role"])
    .orderBy("order")
    .where("task_id", "=", task.id)
    .execute();

  return {
    ...task,
    credits: credits,
  };
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
      <TaskViewer task={task} canEdit={canEdit}/>
    </DefaultLayout>
  );
}

export default Page;
