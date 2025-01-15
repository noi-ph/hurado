import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { ProblemSetSummaryDTO } from "common/types/problem_sets";
import { ProblemSetCard } from "client/components/cards";
import { EmptyNoticePage } from "client/components/empty_notice";

async function getProblemSetsData(): Promise<ProblemSetSummaryDTO[]> {
  const sets = await db
    .selectFrom("problem_sets")
    .select(["id", "title", "slug", "description", "order"])
    .where("is_public", "=", true)
    .orderBy("order", "asc")
    .execute();

  return sets;
}

export async function ProblemSetListPage() {
  const sets = await getProblemSetsData();

  if (sets.length == 0) {
    return (
      <DefaultLayout>
        <EmptyNoticePage />
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4">
        {sets.map((set) => (
          <ProblemSetCard key={set.slug} set={set} />
        ))}
      </div>
    </DefaultLayout>
  );
}

export default ProblemSetListPage;
