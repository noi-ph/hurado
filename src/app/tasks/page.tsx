import { db } from "db";
import { TaskCard } from "client/components/task_card";
import { TaskSummaryDTO, User, UserPublic } from "common/types";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { EmptyNoticePage } from "client/components/empty_notice";
import { getSession } from "server/sessions";

async function getTasksData(user: UserPublic | null): Promise<TaskSummaryDTO[]> {
  let query = db
    .selectFrom("tasks")
    .select(["title", "slug", "description"])
    .limit(1000);
  if (user?.role != 'admin') {
    query = query.where("is_public", "=", true);
  }
  const tasks = await query.execute();
  return tasks;
}

async function Page() {
  const session = await getSession();
  const tasks = await getTasksData(session?.user ?? null);

  if (tasks.length == 0) {
    return (
      <DefaultLayout>
        <EmptyNoticePage />
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.slug} task={task} />
        ))}
      </div>
    </DefaultLayout>
  );
}

export default Page;
