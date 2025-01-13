import type { FunctionComponent } from "react";
import Link from "next/link";
import { getSession } from "server/sessions";
import { getPath, Path } from "client/paths";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ForbiddenPage } from "server/errors/forbidden";
import { canManageContests, canManageProblemSets, canManageTasks } from "server/authorization";

const Page: FunctionComponent = async() => {
  const session = await getSession();

  const tasks = canManageTasks(session);
  const sets = canManageProblemSets(session);
  const contests = canManageContests(session);
  if (!tasks && !sets && !contests) {
    return <ForbiddenPage/>;
  }

  return (
    <DefaultLayout>
      <Link href={getPath({ kind: Path.AdminTaskList })} className="block">
        Tasks
      </Link>
      <Link href={getPath({ kind: Path.AdminProblemSetList })} className="block">
        Problem Sets
      </Link>
      <Link href={getPath({ kind: Path.AdminContestList })} className="block">
        Contests
      </Link>
    </DefaultLayout>
  );
};

export default Page;
