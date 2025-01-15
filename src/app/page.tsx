import { Metadata } from "next";
import type { FunctionComponent } from "react";
import { getSession } from "server/sessions";
import { Homepage } from "client/components/homepage";
import ProblemSetListPage from "./sets/page";


export async function generateMetadata(): Promise<Metadata | null> {
  const session = await getSession();

  if (session == null) {
    return {
      title: "Hurado | NOI.PH Online Judge | The best way to learn math and coding",
    };
  } else {
    return {
      title: "Hurado | Problem Sets",
    };
  }
};

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
