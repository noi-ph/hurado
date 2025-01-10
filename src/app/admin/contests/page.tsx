import { DefaultLayout } from "client/components/layouts/default_layout";
import { getSession } from "server/sessions";
import { ForbiddenPage } from "server/errors/forbidden";
import { canManageContests } from "server/authorization";
import { ContestSummaryDTO } from "common/types";
import { db } from "db";


async function getContestsData(): Promise<ContestSummaryDTO[]> {
  const contests = await db
    .selectFrom("contests")
    .select(["title", "slug", "description"])
    .innerJoin("users", "users.id", "contests.owner_id")
    .limit(1000)
    .execute();

  return contests;
}

async function Page() {
  const session = getSession();
  if (!canManageContests(session)) {
    return <ForbiddenPage/>;
  }

  const contests = await getContestsData();

  return (
    <DefaultLayout>
      <h2 className="text-3xl">Contests</h2>

      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Title</th>
            <th>Owner</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {contests.map((task) => (
            <tr key={task.slug}>
              <td>{task.title}</td>
              <td>{task.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  );
};

export default Page;
