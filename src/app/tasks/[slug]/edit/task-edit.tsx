import { notFound, redirect } from "next/navigation";
import { db } from "db";
import { Task } from "common/types";
import { checkUUIDv4 } from "common/utils/uuid";
import { TaskEditor } from "client/components/task_editor/task_editor";

async function getTaskEditorData(slug: string): Promise<Task | undefined> {
  const task: Task | undefined = await db
    .selectFrom("tasks")
    .selectAll()
    .where((eb) => eb.or([
      eb('slug', '=', slug),
      eb('id', '=', checkUUIDv4(slug)),
    ]))
    .executeTakeFirst();

  return task;
}

type TaskEditPageProps = {
  params: {
    slug: string;
  };
};

export async function TaskEditPage(props: TaskEditPageProps) {
  const task = await getTaskEditorData(props.params.slug);

  if (task == null) {
    return notFound();
  } else if (task.id !== props.params.slug) {
    return redirect(`/tasks/${task.id}/edit`);
  }

  return <TaskEditor task={task}/>;
}
