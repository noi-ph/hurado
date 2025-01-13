import type { FunctionComponent } from "react";

import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import LoginPage from "./login_page";
import { DefaultLayout } from "client/components/layouts/default_layout";

const Page: FunctionComponent = async() => {
  const session = await getSession();
  if (session != null) {
    redirect("/");
  }

  return (
    <DefaultLayout>
      <LoginPage />
    </DefaultLayout>
  );
};

export default Page;
