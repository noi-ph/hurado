import { db } from "db";
import { TaskCard } from "client/components/cards";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { TaskScoredSummaryDTO, TaskSummaryDTO } from "common/types";
import { DefaultLayout } from "client/components/layouts/default_layout";
import { EmptyNoticePage } from "client/components/empty_notice";
import { getSession } from "server/sessions";

async function getTasksData(userId: string | null): Promise<TaskScoredSummaryDTO[]> {
  const tasks = await db
    .selectFrom("tasks")
    .where("is_public", "=", true)
    .leftJoin("overall_verdicts", (join) => 
      join
        .onRef("overall_verdicts.task_id", "=", "tasks.id")
        .on("overall_verdicts.user_id", "=", userId)
        .on("overall_verdicts.contest_id", "is", null)
    )
    .limit(1000)
    .select(["tasks.title", "tasks.slug", "tasks.description", "overall_verdicts.score_overall", "overall_verdicts.score_max"])
    .execute();

  return tasks;
}

async function Page() {
  const session = await getSession();
  const tasks = await getTasksData(session?.user?.id ?? null);

  if (tasks.length == 0) {
    return (
      <DefaultLayout>
        <EmptyNoticePage />
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.slug} task={task} />
        ))}
      </div>
    </DefaultLayout>
  );
}

export default Page;
