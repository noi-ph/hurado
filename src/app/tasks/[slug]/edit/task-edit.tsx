import { notFound, redirect } from "next/navigation";
import { db } from "db";
import { Task, TaskEditorAttachmentKind, TaskEditorTask } from "common/types";
import { checkUUIDv4 } from "common/utils/uuid";
import { TaskEditor } from "client/components/task_editor/task_editor";

async function getTaskEditorData(slug: string): Promise<TaskEditorTask | null> {
  const task: Task | undefined = await db
    .selectFrom("tasks")
    .selectAll()
    .where((eb) => eb.or([
      eb('slug', '=', slug),
      eb('id', '=', checkUUIDv4(slug)),
    ]))
    .executeTakeFirst();

  if (task == null) {
    return null;
  }

  const editor: TaskEditorTask = {
    ...task,
    credits: [
      {
        name: 'Tim',
        role: 'Enchanter',
        deleted: false,
      },
    ],
    attachments: [
      {
        kind: TaskEditorAttachmentKind.Saved,
        id: 'fake-id',
        path: 'some-saved-path',
        deleted: false,
      },
    ],
  };

  return editor;
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
