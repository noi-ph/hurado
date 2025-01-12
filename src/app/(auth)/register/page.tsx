import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { RegisterPage } from "./register_page";


export default function Page() {
  const session = getSession();
  if (session != null) {
    redirect("/");
  }

  return (
    <DefaultLayout>
      <RegisterPage />
    </DefaultLayout>
  );
};
