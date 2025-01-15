import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { PasswordResetPage } from "./password-reset-page";
import { DefaultLayout } from "client/components/layouts/default_layout";

export const metadata: Metadata = {
  title: "Password Reset",
};

async function Page() {
  const session = await getSession();
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
