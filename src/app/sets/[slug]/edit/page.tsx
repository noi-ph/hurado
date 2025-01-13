import { notFound, redirect } from "next/navigation";
import { db } from "db";
import { huradoIDToUUID, uuidToHuradoID } from "common/utils/uuid";
import { ForbiddenPage } from "server/errors/forbidden";
import { getEditorProblemSet } from "server/logic/problem_sets/get_editor_problem_set";
import { getSession } from "server/sessions";
import { ProblemSetEditor } from "client/components/problem_set_editor";

type ProblemSetEditPageProps = {
  params: {
    slug: string;
  };
};

export default async function ProblemSetEditPage(props: ProblemSetEditPageProps) {
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

  const contest = await getEditorProblemSet(uuid);

  if (contest == null) {
    return notFound();
  }

  return <ProblemSetEditor dto={contest} />;
}
