import type { FunctionComponent } from "react";

import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import LoginPage from "./login_page";

const Page: FunctionComponent = () => {
  const session = getSession();
  if (session != null) {
    redirect("/dashboard");
  }
  return <LoginPage />;
};

export default Page;
