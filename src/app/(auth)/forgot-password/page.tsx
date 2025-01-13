
import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { ForgotPasswordPage } from "./forgot-password-page";
import { DefaultLayout } from "client/components/layouts/default_layout";

async function Page() {
  const session = await getSession();
  if (session != null) {
    redirect("/");
  }

  return (
    <DefaultLayout>
      <ForgotPasswordPage />
    </DefaultLayout>
  );
};

export default Page;
