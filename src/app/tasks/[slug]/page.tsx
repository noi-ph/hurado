import { notFound } from "next/navigation";
import { SubmitComponent } from "client/components/submit";
import { Task } from "common/types";
import { db } from "db";

async function getTaskData(slug: string): Promise<Task | undefined> {
  const task: Task | undefined = await db
    .selectFrom("tasks")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();

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
      <SubmitComponent />
    </>
  );
}

export default Page;
