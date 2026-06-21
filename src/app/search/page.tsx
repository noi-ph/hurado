import { sql } from "kysely";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { TaskScoredSummaryDTO } from "common/types";
import { getSession } from "server/sessions";
import { TaskCard } from "client/components/cards/common_card";

async function getSearchResults(queryString: string, userId: string | null): Promise<TaskScoredSummaryDTO[]> {
  const tasks = db.transaction().execute(async (trx) => {
    const tasks = await trx
      .selectFrom("tasks")
      .leftJoin("overall_verdicts", (join) =>
        join.onRef("overall_verdicts.task_id", "=", "tasks.id")
          .on("overall_verdicts.user_id", "=", userId)
      ).select([
        "tasks.id",
        "tasks.slug",
        "tasks.title",
        "tasks.description",
        "overall_verdicts.score_overall",
        "overall_verdicts.score_max"
      ]).execute();

    return tasks;
  });

  return tasks
}

export async function SearchResultsPage({ searchParams }: { searchParams: Promise<{ query: string }> }) {
  const session = await getSession();
  const userId = session?.user?.id ?? null;

  const params = await searchParams;
  const queryString = params.query;

  const results = await getSearchResults(queryString, userId);
  return (
    <DefaultLayout>
      <p> {results.length} results found </p>
      {results.map((task) => (
        <TaskCard key={task.slug} task={task} />
      ))}
    </DefaultLayout>
  );
}

export default SearchResultsPage;
