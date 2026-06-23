import { sql } from "kysely";
import { db } from "db";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { TaskScoredSummaryDTO } from "common/types";
import { getSession } from "server/sessions";
import { TaskCard } from "client/components/cards/common_card";
import { ProblemSearchBar } from "client/components/problem_search_bar/problem_search_bar";

async function getSearchResults(queryString: string, userId: string | null): Promise<TaskScoredSummaryDTO[]> {
  const tasks = db.selectFrom("tasks")
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
      ])
      .where('tasks.title', 'ilike', sql<string>`CONCAT('%', ${queryString}::text, '%')`).execute();

  return tasks;
}

export async function SearchResultsPage({ searchParams }: { searchParams: Promise<{ query: string }> }) {
  const session = await getSession();
  const userId = session?.user?.id ?? null;

  const params = await searchParams;
  const queryString = params.query;


  const results = await getSearchResults(queryString, userId);
  return (
    <DefaultLayout>
      <ProblemSearchBar />
      <div className="mt-2 mb-4">
        {results.length} result(s) found for task named &quot; {queryString} &quot;
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        {results.map((task) => (
          <TaskCard key={task.slug} task={task} />
        ))}
      </div>
    </DefaultLayout>
  );
}

export default SearchResultsPage;
