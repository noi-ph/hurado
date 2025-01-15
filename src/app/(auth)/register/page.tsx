import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { RegisterPage } from "./register_page";

export const metadata: Metadata = {
  title: "Register",
};

export default async function Page() {
  const session = await getSession();
  if (session != null) {
    redirect("/");
  }

  return (
    <DefaultLayout>
      <RegisterPage />
    </DefaultLayout>
  );
};
