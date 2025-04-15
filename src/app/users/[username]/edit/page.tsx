import { notFound } from "next/navigation";
import { db } from "db";
import { UserLookupDTO } from "common/types";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { UserEditor } from "client/components/user/user_editor";
import { ForbiddenPage } from "server/errors/forbidden";
import { getSession } from "server/sessions";
import { canManageUser } from "server/authorization";

async function getUser(username: string): Promise<UserLookupDTO | null> {
  return db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom("users")
      .select(["id", "username", "name", "school", "role"])
      .where("username", "=", username)
      .executeTakeFirst();

    if (user == null) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      school: user.school,
      role: user.role,
    };
  });
}

type ProfileEditPageProps = {
  params: { username: string };
};

async function Page(props: ProfileEditPageProps) {
  const user = await getUser(props.params.username);

  if (user == null) {
    return notFound();
  }

  const session = await getSession();
  const canEdit = canManageUser(session, user.id);

  if (!canEdit) {
    return <ForbiddenPage />;
  }

  return (
    <DefaultLayout>
      <>
        <UserEditor user={user} />
      </>
    </DefaultLayout>
  );
}

export default Page;
