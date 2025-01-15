import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { canManageContests } from "server/authorization";
import { getSession } from "server/sessions";
import { ContestViewerDTO, TaskSummaryDTO } from "common/types";
import { ContestViewer } from "client/components/contest_viewer/contest_viewer";

async function getContestData(slug: string): Promise<ContestViewerDTO | null> {
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
  const contest = await getCachedContestData(props.params.slug);

  if (contest == null) {
    return null;
  }

  return {
    title: contest.title,
    description: contest.description
  };
};

async function Page(props: ContestPageProps) {
  const contest = await getContestData(props.params.slug);

  if (contest == null) {
    return notFound();
  }

  const session = await getSession();
  const canEdit = canManageContests(session);

  return (
    <DefaultLayout>
      <ContestViewer contest={contest} canEdit={canEdit} />
    </DefaultLayout>
  );
}

export default Page;
