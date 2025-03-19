import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "db";
import { TaskEditor } from "client/components/task_editor/task_editor";
import { ForbiddenPage } from "server/errors/forbidden";
import { getEditorTask } from "server/logic/tasks/get_editor_task";
import { getSession } from "server/sessions";
import { makeFindFromSlugOrHID, SlugLookup } from "server/slugs";
import { getPath, Path } from "client/paths";

async function lookupTaskID(slug: string): Promise<string | undefined> {
  const task = await db
    .selectFrom("tasks")
    .select("id")
    .where("slug", "=", slug)
    .executeTakeFirst();
  return task?.id;
}

const getCachedEditorTask = cache(getEditorTask);
const findFromSlugOrHID = makeFindFromSlugOrHID(lookupTaskID);

type TaskEditPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(props: TaskEditPageProps): Promise<Metadata | null> {
  const lookup = await findFromSlugOrHID(props.params.slug);
  if (lookup.kind == SlugLookup.NotFound || lookup.kind == SlugLookup.Slug) {
    return null;
  }

  const task = await getCachedEditorTask(lookup.uuid);

  if (task == null) {
    return null;
  }

  return {
    title: `Admin | ${task.title}`,
    description: task.description,
  };
}

export default async function TaskEditPage(props: TaskEditPageProps) {
  const session = await getSession();
  if (session == null || session.user.role != "admin") {
    return <ForbiddenPage />;
  }

  const lookup = await findFromSlugOrHID(props.params.slug);
  if (lookup.kind == SlugLookup.NotFound) {
    return notFound();
  } else if (lookup.kind == SlugLookup.Slug) {
    return redirect(getPath({ kind: Path.TaskEdit, uuid: lookup.uuid }));
  }

  const task = await getCachedEditorTask(lookup.uuid);

  if (task == null) {
    return notFound();
  }

  return <TaskEditor dto={task} />;
}
