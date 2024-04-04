import knex from "db";
import { Task } from "lib/models";
import { TaskCard } from "lib/components";

async function getTasksData(): Promise<Task[]> {
  const tasks = await knex
    .table("tasks")
    .select(["title", "slug", "description"])
    .limit(1000);

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
