import Link from "next/link";
import { ReactNode } from "react";
import { db } from "db";
import { AdminTable, AdminTbody, AdminTD, AdminTH, AdminThead, AdminTR } from "client/components/admin_table/admin_table";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ContestCreator } from "client/components/contest_creator";
import { EmptyNotice } from "client/components/empty_notice";
import { getPath, Path } from "client/paths";
import { SessionData } from "common/types";
import { uuidToHuradoID } from "common/utils/uuid";
import { canManageContests } from "server/authorization";
import { getSession } from "server/sessions";
import { ForbiddenPage } from "server/errors/forbidden";


type ContestSummaryAdminDTO = {
  id: string;
  title: string;
  slug: string;
  owner: string;
  created_at: Date;
};

async function getContestsData(session: SessionData): Promise<ContestSummaryAdminDTO[]> {
  const contests = await db
    .selectFrom("contests")
    .innerJoin("users", "users.id", "contests.owner_id")
    .select([
      "contests.id",
      "contests.title",
      "contests.slug",
      "contests.created_at",
      "users.username as owner",
    ])
    .orderBy("contests.created_at", "desc")
    .limit(1000)
    .execute() satisfies ContestSummaryAdminDTO[];

  return contests;
}


async function Page() {
  const session = await getSession();

  if (session == null || !canManageContests(session)) {
    return <ForbiddenPage/>;
  }

  const contests = await getContestsData(session);

  let content: ReactNode = null;
  if (contests.length == 0) {
    content = <EmptyNotice className="mt-12"/>;
  } else {
    content = (
      <AdminTable className="mt-6">
        <AdminThead>
          <AdminTR>
            <AdminTH>ID</AdminTH>
            <AdminTH>Slug</AdminTH>
            <AdminTH>Title</AdminTH>
            <AdminTH>Owner</AdminTH>
            <AdminTH>Created At</AdminTH>
            <AdminTH>Actions</AdminTH>
          </AdminTR>
        </AdminThead>
        <AdminTbody>
          {contests.map((contest) => (
            <AdminTR key={contest.slug}>
              <AdminTD className="font-mono text-sm">{uuidToHuradoID(contest.id)}</AdminTD>
              <AdminTD className="font-mono text-sm">
                <Link href={getPath({ kind: Path.ContestView, slug: contest.slug })} className="text-blue-400 hover:text-blue-500">
                  {contest.slug}
                </Link>
              </AdminTD>
              <AdminTD>{contest.title}</AdminTD>
              <AdminTD>{contest.owner}</AdminTD>
              <AdminTD>{contest.created_at.toLocaleDateString()}</AdminTD>
              <AdminTD>
                <Link href={getPath({ kind: Path.ContestEdit, uuid: contest.id })} className="text-blue-400 hover:text-blue-500">
                  Edit
                </Link>
              </AdminTD>
            </AdminTR>
          ))}
        </AdminTbody>
      </AdminTable>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl">Contests</h2>
        <ContestCreator/>
      </div>
      {content}
    </DefaultLayout>
  );
};

export default Page;
