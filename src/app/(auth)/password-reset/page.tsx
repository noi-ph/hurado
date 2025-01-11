
import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { PasswordResetPage } from "./password-reset-page";
import { DefaultLayout } from "client/components/layouts/default_layout";

function Page() {
  const session = getSession();
  if (session != null) {
    redirect("/");
  }

  return (
    <DefaultLayout>
      <PasswordResetPage />
    </DefaultLayout>
  );
};

export default Page;
