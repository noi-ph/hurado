import { notFound } from "next/navigation";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { huradoIDToUUID } from "common/utils/uuid";
import { SubmissionViewer } from "client/components/submission_viewer/submission_viewer";
import { getSubmissionViewerDTO } from "server/logic/submissions/get_submission";
import { getSession } from "server/sessions";
import { canManageTasks } from "server/authorization";

type SubmissionPageProps = {
  params: {
    hid: string;
  };
};

async function Page(props: SubmissionPageProps) {
  const uuid = huradoIDToUUID(props.params.hid);
  if (uuid == null) {
    return notFound();
  }
  const session = await getSession();
  if (session == null || session.user == null) {
    return notFound();
  }

  const isTaskManager = canManageTasks(session);
  const submission = await getSubmissionViewerDTO(uuid, session.user, isTaskManager);

  if (submission == null) {
    return notFound();
  }

  return (
    <DefaultLayout>
      <SubmissionViewer submission={submission} isAdmin={session.user.role === "admin"} />
    </DefaultLayout>
  );
}

export default Page;
