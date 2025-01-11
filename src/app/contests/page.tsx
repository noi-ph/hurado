import { db } from "db";
import { ContestCard } from "client/components/contest_card/contest_card";
import { ContestSummaryDTO } from "common/types";
import { DefaultLayout } from "client/components/layouts/default_layout";

async function getContestsData(): Promise<ContestSummaryDTO[]> {
  const contests = await db
    .selectFrom("contests")
    .where("is_public", "=", true)
    .select(["title", "slug", "description"])
    .orderBy("start_time", "desc")
    .limit(1000)
    .execute();

  return contests;
}

async function Page() {
  const contests = await getContestsData();

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4">
        {contests.map((contest) => (
          <ContestCard key={contest.slug} contest={contest} />
        ))}
      </div>
    </DefaultLayout>
  );
}

export default Page;
