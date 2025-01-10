import { db } from "db";
import { TaskCard } from "client/components/task_card";
import { TaskSummaryDTO } from "common/types";
import { DefaultLayout } from "client/components/layouts/default_layout";

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
