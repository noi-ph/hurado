import { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { db } from "db";
import { AdminTable, AdminTbody, AdminTD, AdminTH, AdminThead, AdminTR } from "client/components/admin_table/admin_table";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { EmptyNotice } from "client/components/empty_notice";
import { TaskCreator } from "client/components/task_creator";
import { getPath, Path } from "client/paths";
import { SessionData } from "common/types";
import { uuidToHuradoID } from "common/utils/uuid";
import { canManageTasks } from "server/authorization";
import { getSession } from "server/sessions";
import { ForbiddenPage } from "server/errors/forbidden";

export const metadata: Metadata = {
  title: "Admin | Tasks",
};

type TaskSummaryAdminDTO = {
  id: string;
  title: string;
  slug: string;
  owner: string;
  created_at: Date;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
async function getTasksData(session: SessionData): Promise<TaskSummaryAdminDTO[]> {
  const tasks = await db
    .selectFrom("tasks")
    .innerJoin("users", "users.id", "tasks.owner_id")
    .select([
      "tasks.id",
      "tasks.title",
      "tasks.slug",
      "tasks.created_at",
      "users.username as owner",
    ])
    .orderBy("tasks.created_at", "desc")
    .limit(1000)
    .execute() satisfies TaskSummaryAdminDTO[];

  return tasks;
}


async function Page() {
  const session = await getSession();

  if (session == null || !canManageTasks(session)) {
    return <ForbiddenPage/>;
  }

  const tasks = await getTasksData(session);

  let content: ReactNode = null;
  if (tasks.length == 0) {
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
          {tasks.map((task) => (
            <AdminTR key={task.slug}>
              <AdminTD className="font-mono text-sm">{uuidToHuradoID(task.id)}</AdminTD>
              <AdminTD className="font-mono text-sm">
                <Link href={getPath({ kind: Path.TaskView, slug: task.slug })} className="text-blue-400 hover:text-blue-500">
                  {task.slug}
                </Link>
              </AdminTD>
              <AdminTD>{task.title}</AdminTD>
              <AdminTD>{task.owner}</AdminTD>
              <AdminTD>{task.created_at.toLocaleDateString()}</AdminTD>
              <AdminTD>
                <Link href={getPath({ kind: Path.TaskEdit, uuid: task.id })} className="text-blue-400 hover:text-blue-500">
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
        <h2 className="text-3xl">Tasks</h2>
        <TaskCreator/>
      </div>
      {content}
    </DefaultLayout>
  );
};

export default Page;
