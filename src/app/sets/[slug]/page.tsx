import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { ProblemSetViewerDTO, TaskScoredSummaryDTO, TaskSummaryDTO } from "common/types";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ProblemSetViewer } from "client/components/problem_set_viewer/problem_set_viewer";
import { canManageProblemSets } from "server/authorization";
import { getSession } from "server/sessions";

async function getProblemSetData(slug: string, userId: string | null): Promise<ProblemSetViewerDTO | null> {
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
      .leftJoin("overall_verdicts", (join) => 
        join
          .onRef("overall_verdicts.task_id", "=", "tasks.id")
          .on("overall_verdicts.user_id", "=", userId)
          .on("overall_verdicts.contest_id", "is", null)
      )
      .select([
        "tasks.id",
        "tasks.slug",
        "tasks.title",
        "tasks.description",
        "overall_verdicts.score_overall",
        "overall_verdicts.score_max",
      ])
      .execute();

    const tasks: TaskScoredSummaryDTO[] = dbTasks.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      score_overall: t.score_overall,
      score_max: t.score_max,
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

const getCachedProblemSetData = cache(getProblemSetData);

type ProblemSetPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(props: ProblemSetPageProps): Promise<Metadata | null> {
  const session = await getSession();
  const set = await getCachedProblemSetData(props.params.slug, session?.user?.id ?? null);

  if (set == null) {
    return null;
  }

  return {
    title: set.title,
    description: set.description
  };
};


async function Page(props: ProblemSetPageProps) {
  const session = await getSession();
  const set = await getCachedProblemSetData(props.params.slug, session?.user?.id ?? null);

  if (set == null) {
    return notFound();
  }

  const canEdit = canManageProblemSets(session);
  return (
    <DefaultLayout>
      <ProblemSetViewer set={set} canEdit={canEdit} />
    </DefaultLayout>
  );
}

export default Page;
