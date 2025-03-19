import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ForgotPasswordPage } from "./forgot-password-page";

export const metadata: Metadata = {
  title: "Forgot Password",
};

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
}

export default Page;
