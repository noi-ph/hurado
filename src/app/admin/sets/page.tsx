import Link from "next/link";
import { db } from "db";
import { AdminTable, AdminTbody, AdminTD, AdminTH, AdminThead, AdminTR } from "client/components/admin_table/admin_table";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ProblemSetCreator } from "client/components/problem_set_creator";
import { getPath, Path } from "client/paths";
import { SessionData } from "common/types";
import { uuidToHuradoID } from "common/utils/uuid";
import { canManageProblemSets } from "server/authorization";
import { getSession } from "server/sessions";
import { ForbiddenPage } from "server/errors/forbidden";


type ProblemSetSummaryAdminDTO = {
  id: string;
  title: string;
  slug: string;
  is_public: boolean;
  order: number;
};

async function getProblemSetsData(session: SessionData): Promise<ProblemSetSummaryAdminDTO[]> {
  const sets = await db
    .selectFrom("problem_sets")
    .select([
      "id",
      "title",
      "slug",
      "is_public",
      "order",
    ])
    .orderBy("order", "asc")
    .limit(1000)
    .execute() satisfies ProblemSetSummaryAdminDTO[];

  return sets;
}


async function Page() {
  const session = await getSession();

  if (session == null || !canManageProblemSets(session)) {
    return <ForbiddenPage/>;
  }

  const tasks = await getProblemSetsData(session);

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl">ProblemSets</h2>
        <ProblemSetCreator/>
      </div>
      <AdminTable className="mt-6">
        <AdminThead>
          <AdminTR>
            <AdminTH>ID</AdminTH>
            <AdminTH>Slug</AdminTH>
            <AdminTH>Title</AdminTH>
            <AdminTH>Public</AdminTH>
            <AdminTH>Order</AdminTH>
            <AdminTH>Actions</AdminTH>
          </AdminTR>
        </AdminThead>
        <AdminTbody>
          {tasks.map((task) => (
            <AdminTR key={task.slug}>
              <AdminTD className="font-mono text-sm">{uuidToHuradoID(task.id)}</AdminTD>
              <AdminTD className="font-mono text-sm">
                <Link href={getPath({ kind: Path.ProblemSetView, slug: task.slug })} className="text-blue-400 hover:text-blue-500">
                  {task.slug}
                </Link>
              </AdminTD>
              <AdminTD>{task.title}</AdminTD>
              <AdminTD>{task.is_public ? "Yes" : "No" }</AdminTD>
              <AdminTD>{task.order}</AdminTD>
              <AdminTD>
                <Link href={getPath({ kind: Path.ProblemSetEdit, uuid: task.id })} className="text-blue-400 hover:text-blue-500">
                  Edit
                </Link>
              </AdminTD>
            </AdminTR>
          ))}
        </AdminTbody>
      </AdminTable>
    </DefaultLayout>
  );
};

export default Page;
