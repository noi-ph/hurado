import { db } from "db";
import { TaskCard } from "lib/components";
import { TaskSummary } from "lib/models";

async function getTasksData(): Promise<TaskSummary[]> {
  const tasks = await db
    .selectFrom("tasks")
    .select(["title", "slug", "description"])
    .limit(1000)
    .execute();

  return tasks;
}

async function Page() {
  const tasks = await getTasksData();

  return (
    <>
      {tasks.map((task) => (
        <TaskCard key={task.slug} task={task} />
      ))}
    </>
  );
}

export default Page;
