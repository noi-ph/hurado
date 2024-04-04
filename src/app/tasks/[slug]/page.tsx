import { notFound } from "next/navigation";
import knex from "db";
import type { Task } from "lib/models";

async function getTaskData(slug: string): Promise<Task | undefined> {
  const task = await knex
    .table("tasks")
    .select(["title", "description", "statement"])
    .where({ slug })
    .first();

  return task;
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

  return (
    <>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      <p>{task.statement}</p>
    </>
  );
}

export default Page;
