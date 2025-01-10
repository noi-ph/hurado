import type { FunctionComponent } from "react";
import { getSession } from "server/sessions";
import { ForbiddenPage } from "server/errors/forbidden";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { canManageProblemSets } from "server/authorization";

const Page: FunctionComponent = () => {
  const session = getSession();

  if (!canManageProblemSets(session)) {
    return <ForbiddenPage/>;
  }

  return (
    <DefaultLayout>
      Problem Set list!
    </DefaultLayout>
  );
};

export default Page;
