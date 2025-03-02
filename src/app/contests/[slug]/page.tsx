import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { canManageContests } from "server/authorization";
import { getSession } from "server/sessions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { ContestViewerDTO, TaskScoredSummaryDTO, TaskSummaryDTO } from "common/types";
import { ContestViewer } from "client/components/contest_viewer/contest_viewer";

async function getContestData(slug: string, userId: string | null): Promise<ContestViewerDTO | null> {
  return db.transaction().execute(async (trx) => {
    const contest = await trx
      .selectFrom("contests")
      .select(["id", "slug", "title", "description", "statement", "start_time", "end_time"])
      .where("slug", "=", slug)
      .executeTakeFirst();

    if (contest == null) {
      return null;
    }

    const dbTasks = await trx
      .selectFrom("tasks")
      .innerJoin("contest_tasks", "tasks.id", "contest_tasks.task_id")
      .orderBy(["contest_tasks.order", "tasks.title"])
      .where("contest_tasks.contest_id", "=", contest.id)
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
      id: contest.id,
      slug: contest.slug,
      title: contest.title,
      description: contest.description,
      statement: contest.statement,
      start_time: contest.start_time,
      end_time: contest.end_time,
      tasks: tasks,
    } satisfies ContestViewerDTO;
  });
}

const getCachedContestData = cache(getContestData);

type ContestPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(props: ContestPageProps): Promise<Metadata | null> {
  const contest = await getCachedContestData(props.params.slug, null);

  if (contest == null) {
    return null;
  }

  return {
    title: contest.title,
    description: contest.description
  };
};

async function Page(props: ContestPageProps) {
  const session = await getSession();
  const contest = await getContestData(props.params.slug, session?.user?.id ?? null);

  if (contest == null) {
    return notFound();
  }

  const canEdit = canManageContests(session);

  return (
    <DefaultLayout>
      <ContestViewer contest={contest} canEdit={canEdit} />
    </DefaultLayout>
  );
}

export default Page;
