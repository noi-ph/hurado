import { db } from "db";
import { ProblemSetEditorDTO } from "common/validation/problem_set_validation";

export async function getEditorProblemSet(uuid: string): Promise<ProblemSetEditorDTO | null> {
  return db.transaction().execute(async (trx) => {
    const set = await trx
      .selectFrom("problem_sets")
      .select(["id", "title", "slug", "description", "is_public", "order"])
      .where("id", "=", uuid)
      .executeTakeFirst();

    if (set == null) {
      return null;
    }

    const dbTasks = await trx
      .selectFrom("tasks")
      .innerJoin("problem_set_tasks", "tasks.id", "problem_set_tasks.task_id")
      .orderBy(["problem_set_tasks.order", "tasks.title"])
      .where("problem_set_tasks.set_id", "=", set.id)
      .select([
        "problem_set_tasks.order",
        "tasks.id",
        "tasks.slug",
        "tasks.title",
        "tasks.description",
      ])
      .execute();

    const dbNesteds = await trx
      .selectFrom("problem_sets")
      .innerJoin("problem_set_nesteds", "problem_sets.id", "problem_set_nesteds.child_id")
      .orderBy(["problem_set_nesteds.order", "problem_sets.title"])
      .where("problem_set_nesteds.parent_id", "=", set.id)
      .select([
        "problem_set_nesteds.order",
        "problem_sets.id",
        "problem_sets.slug",
        "problem_sets.title",
        "problem_sets.description",
      ])
      .execute();

    return {
      id: set.id,
      slug: set.slug,
      title: set.title,
      description: set.description,
      is_public: set.is_public,
      order: set.order,
      tasks: dbTasks.map((task) => ({
        task_id: task.id,
        title: task.title,
        slug: task.slug,
        order: task.order,
      })),
      nesteds: dbNesteds.map((nested) => ({
        child_id: nested.id,
        title: nested.title,
        slug: nested.slug,
        order: nested.order,
      })),
    } satisfies ProblemSetEditorDTO;
  });
}
