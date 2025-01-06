import type { FunctionComponent } from "react";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { Homepage } from "client/components/homepage";
import { getSession } from "server/sessions";

const Page: FunctionComponent = () => {
  const session = getSession();

  if (session == null) {
    return (
      <Homepage/>
    );
  } else {
    return (
      <DefaultLayout>
        You are logged in!
      </DefaultLayout>
    );
  }
};

export default Page;
