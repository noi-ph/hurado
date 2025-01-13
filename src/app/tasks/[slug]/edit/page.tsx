import { notFound, redirect } from "next/navigation";
import { db } from "db";
import { huradoIDToUUID, uuidToHuradoID } from "common/utils/uuid";
import { TaskEditor } from "client/components/task_editor/task_editor";
import { ForbiddenPage } from "server/errors/forbidden";
import { getEditorTask } from "server/logic/tasks/get_editor_task";
import { getSession } from "server/sessions";

type TaskEditPageProps = {
  params: {
    slug: string;
  };
};

export default async function TaskEditPage(props: TaskEditPageProps) {
  const session = await getSession();
  if (session == null || session.user.role != "admin") {
    return <ForbiddenPage/>;
  }

  const uuid = huradoIDToUUID(props.params.slug);
  if (uuid == null) {
    const task = await db
      .selectFrom("tasks")
      .select("id")
      .where("slug", "=", props.params.slug)
      .executeTakeFirst();

    if (task == null) {
      return notFound();
    }

    const hid = uuidToHuradoID(task.id);
    return redirect(`/tasks/${hid}/edit`);
  }

  const task = await getEditorTask(uuid);

  if (task == null) {
    return notFound();
  }

  return <TaskEditor dto={task} />;
}
