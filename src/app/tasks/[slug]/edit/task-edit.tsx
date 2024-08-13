import { notFound, redirect } from "next/navigation";
import { db } from "db";
import { Task, TaskSSR } from "common/types";
import { checkUUIDv4 } from "common/utils/uuid";
import { TaskEditor } from "client/components/task_editor/task_editor";
import { getSession } from "server/sessions";

export async function getServerSideProps() {
  const session = getSession();
  if (session == null || session.user.role != 'admin') {
    return { errorCode: 403 };
  }
}

async function getTaskEditorData(slug: string): Promise<TaskSSR | null> {
  const task = await db
    .selectFrom("tasks")
    .select(['id', 'title', 'slug', 'description', 'statement'])
    .where((eb) => eb.or([
      eb('slug', '=', slug),
      eb('id', '=', checkUUIDv4(slug)),
    ]))
    .executeTakeFirst();

  if (task == null) {
    return null;
  }

  const editor: TaskSSR = {
    ...task,
    checker: 'dummy',
    credits: [
      {
        id: 'fake-id',
        name: 'Tim',
        role: 'Enchanter',
      },
    ],
    attachments: [
      {
        id: 'fake-id',
        path: 'some-saved-path',
        mime_type: 'fake-mimetype',
        file_id: 'fake-file-id',
      },
    ],
    subtasks: [
      {
        id: 'fake-id',
        name: 'Subtask 1',
        order: 0,
        score_max: 100,
        test_data: [
          {
            id: 'fake-id',
            name: 'data-1a',
            order: 0,
            input_file_id: 'fake-input-id',
            input_file_name: 'Fake Input File',
            output_file_id: 'fake-output-id',
            output_file_name: 'Fake Output File',
            judge_file_id: null,
            judge_file_name: null,
            is_sample: false,
          }
        ],
      },
    ],
    files: [
      {
        id: 'fake-file-id',
        hash: 'fake-hash',
      },
      {
        id: 'fake-input-id',
        hash: 'fake-input-hash',
      },
      {
        id: 'fake-output-id',
        hash: 'fake-output-hash',
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

  return <TaskEditor ssr={task}/>;
}
