import { notFound, redirect } from "next/navigation";
import { TaskEditor } from "client/components/task_editor/task_editor";
import { getSession } from "server/sessions";
import { getEditorTask } from "server/logic/tasks/get_editor_task";
import { huradoIDToUUID, uuidToHuradoID } from "common/utils/uuid";
import { db } from "db";

type TaskEditPageProps = {
  params: {
    slug: string;
  };
};

export default async function TaskEditPage(props: TaskEditPageProps) {
  const session = getSession();
  if (session == null || session.user.role != "admin") {
    return { errorCode: 403 };
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
