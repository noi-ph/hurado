import type { FunctionComponent } from "react";
import { getSession } from "server/sessions";
import { Homepage } from "client/components/homepage";
import ProblemSetListPage from "./sets/page";

const Page: FunctionComponent = async() => {
  const session = await getSession();

  if (session == null) {
    return (
      <Homepage/>
    );
  } else {
    return (
      <ProblemSetListPage/>
    );
  }
};

export default Page;
