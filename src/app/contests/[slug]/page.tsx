import { notFound } from "next/navigation";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { canManageContests } from "server/authorization";
import { getSession } from "server/sessions";
import { ContestViewerDTO } from "common/types";
import { ContestViewer } from "client/components/contest_viewer/contest_viewer";

async function getContestData(slug: string): Promise<ContestViewerDTO | null> {
  return db.transaction().execute(async (trx) => {
    const contest = await trx
      .selectFrom("contests")
      .select(["id", "slug", "title", "description", "start_time", "end_time"])
      .where("slug", "=", slug)
      .executeTakeFirst();

    if (contest == null) {
      return null;
    }

    return {
      id: contest.id,
      slug: contest.slug,
      title: contest.title,
      description: contest.description,
      start_time: contest.start_time,
      end_time: contest.end_time,
    };
  });
}

type ContestPageProps = {
  params: {
    slug: string;
  };
};

async function Page(props: ContestPageProps) {
  const contest = await getContestData(props.params.slug);

  if (contest == null) {
    return notFound();
  }

  const session = getSession();
  const canEdit = canManageContests(session);

  return (
    <DefaultLayout>
      <ContestViewer contest={contest} canEdit={canEdit} />
    </DefaultLayout>
  );
}

export default Page;
