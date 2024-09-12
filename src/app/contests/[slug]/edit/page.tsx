import { notFound, redirect } from "next/navigation";
import { getSession } from "server/sessions";
import { huradoIDToUUID, uuidToHuradoID } from "common/utils/uuid";
import { db } from "db";

type ContestEditPageProps = {
  params: {
    slug: string;
  };
};

export default async function ContestEditPage(props: ContestEditPageProps) {
  const session = getSession();
  if (session == null || session.user.role != "admin") {
    return { errorCode: 403 };
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

  return 'Nothing here yet';
  // const contest = await getEditorContest(uuid);

  // if (contest == null) {
  //   return notFound();
  // }

  // return <ContestEditor dto={contest} />;
}
