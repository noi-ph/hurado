import { notFound } from "next/navigation";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { huradoIDToUUID } from "common/utils/uuid";
import { SubmissionViewer } from "client/components/submission_viewer/submission_viewer";
import { getSubmissionViewerDTO } from "server/logic/submissions/get_submission";

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

  const submission = await getSubmissionViewerDTO(uuid);

  if (submission == null) {
    return notFound();
  }

  return (
    <DefaultLayout>
      <SubmissionViewer submission={submission} />
    </DefaultLayout>
  );
}

export default Page;
