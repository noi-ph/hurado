import { notFound, redirect } from "next/navigation";
import { db } from "db";
import { huradoIDToUUID, uuidToHuradoID } from "common/utils/uuid";
import { ContestEditor } from "client/components/contest_editor";
import { ForbiddenPage } from "server/errors/forbidden";
import { getEditorContest } from "server/logic/contests/get_editor_contest";
import { getSession } from "server/sessions";

type ContestEditPageProps = {
  params: {
    slug: string;
  };
};

export default async function ContestEditPage(props: ContestEditPageProps) {
  const session = await getSession();
  if (session == null || session.user.role != "admin") {
    return <ForbiddenPage/>;
  }

  const uuid = huradoIDToUUID(props.params.slug);
  if (uuid == null) {
    const contest = await db
      .selectFrom("contests")
      .select("id")
      .where("slug", "=", props.params.slug)
      .executeTakeFirst();

    if (contest == null) {
      return notFound();
    }

    const hid = uuidToHuradoID(contest.id);
    return redirect(`/contests/${hid}/edit`);
  }

  const contest = await getEditorContest(uuid);

  if (contest == null) {
    return notFound();
  }

  return <ContestEditor dto={contest} />;
}
