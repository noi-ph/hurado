import { db } from "db";
import { TaskCard } from "client/components/cards";
import { TaskSummaryDTO } from "common/types";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { EmptyNoticePage } from "client/components/empty_notice";

async function getTasksData(): Promise<TaskSummaryDTO[]> {
  const tasks = await db
    .selectFrom("tasks")
    .select(["title", "slug", "description"])
    .where("is_public", "=", true)
    .limit(1000)
    .execute();

  return tasks;
}

async function Page() {
  const tasks = await getTasksData();

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
