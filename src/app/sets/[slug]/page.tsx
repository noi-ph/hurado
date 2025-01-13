import { notFound } from "next/navigation";
import { ProblemSetViewerDTO, TaskSummaryDTO } from "common/types";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ProblemSetViewer } from "client/components/problem_set_viewer/problem_set_viewer";
import { canManageProblemSets } from "server/authorization";
import { getSession } from "server/sessions";

async function getProblemSetData(slug: string): Promise<ProblemSetViewerDTO | null> {
  return db.transaction().execute(async (trx) => {
    const set = await trx
      .selectFrom("problem_sets")
      .select(["id", "slug", "title", "description", "is_public", "order"])
      .where("slug", "=", slug)
      .executeTakeFirst();

    if (set == null) {
      return null;
    }

    const dbTasks = await trx
      .selectFrom("tasks")
      .innerJoin("problem_set_tasks", "tasks.id", "problem_set_tasks.task_id")
      .orderBy(["problem_set_tasks.order", "tasks.title"])
      .where("problem_set_tasks.set_id", "=", set.id)
      .select([
        "tasks.id",
        "tasks.slug",
        "tasks.title",
        "tasks.description",
      ])
      .execute();

    const tasks: TaskSummaryDTO[] = dbTasks.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
    }));

    return {
      id: set.id,
      slug: set.slug,
      title: set.title,
      description: set.description,
      is_public: set.is_public,
      order: set.order,
      tasks: tasks,
    } satisfies ProblemSetViewerDTO;
  });
}

type ProblemSetPageProps = {
  params: {
    slug: string;
  };
};

async function Page(props: ProblemSetPageProps) {
  const set = await getProblemSetData(props.params.slug);

  if (set == null) {
    return notFound();
  }

  const session = await getSession();
  const canEdit = canManageProblemSets(session);
  return (
    <DefaultLayout>
      <ProblemSetViewer set={set} canEdit={canEdit} />
    </DefaultLayout>
  );
}

export default Page;
