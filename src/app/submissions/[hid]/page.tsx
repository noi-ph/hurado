import { notFound } from "next/navigation";
import { db } from "db";
import { SubmissionSummaryDTO } from "common/types/submissions";
import { Language } from "common/types/constants";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { checkUUIDv4, huradoIDToUUID } from "common/utils/uuid";

async function getSubmissionData(id: string | null): Promise<SubmissionSummaryDTO | null> {
  const dbsub = await db
    .selectFrom("submissions")
    .leftJoin("verdicts", "verdicts.id", "submissions.official_verdict_id")
    .select([
      "submissions.id",
      "submissions.language",
      "submissions.created_at",
      "verdicts.verdict",
      "verdicts.raw_score",
      "verdicts.running_time_ms",
      "verdicts.running_memory_byte",
    ])
    .where("submissions.id", "=", checkUUIDv4(id))
    .orderBy("submissions.created_at", "desc")
    .executeTakeFirstOrThrow();

  const submission: SubmissionSummaryDTO = {
    id: dbsub.id,
    language: dbsub.language as Language,
    created_at: dbsub.created_at,
    verdict: dbsub.verdict,
    score: dbsub.raw_score,
    running_time_ms: dbsub.running_time_ms,
    running_memory_byte: dbsub.running_memory_byte,
  };

  return submission;
}

type SubmissionPageProps = {
  params: {
    hid: string;
  };
};

async function Page(props: SubmissionPageProps) {
  const uuid = huradoIDToUUID(props.params.hid);
  const submission = await getSubmissionData(uuid);

  if (submission == null) {
    return notFound();
  }

  return (
    <DefaultLayout>
      {submission.id}
      {submission.language}
      {submission.created_at.toString()}
    </DefaultLayout>
  );
}

export default Page;
