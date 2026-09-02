import { Transaction } from "kysely";
import { db } from "db";
import { Models } from "common/types";
import {
  ProblemSetUpdateDTO,
  ProblemSetEditorDTO,
  ProblemSetTaskUpdateDTO,
  ProblemSetTaskEditorDTO,
  ProblemSetNestedUpdateDTO,
  ProblemSetNestedEditorDTO,
} from "common/validation/problem_set_validation";
import { notNull } from "common/utils/guards";

type Ordered<T> = T & {
  order: number;
};

function makeOrdered<T>(arr: T[]): Ordered<T>[] {
  return arr.map((obj, index) => ({
    ...obj,
    order: index + 1,
  }));
}

async function upsertProblemSetTasks(
  trx: Transaction<Models>,
  problemSetId: string,
  tasks: ProblemSetTaskUpdateDTO[]
): Promise<ProblemSetTaskEditorDTO[]> {
  const tasksOrdered = makeOrdered(tasks);
  await trx.deleteFrom("problem_set_tasks").where("set_id", "=", problemSetId).execute();

  const dbProblemSetTasks =
    tasksOrdered.length <= 0
      ? []
      : await trx
          .insertInto("problem_set_tasks")
          .values(
            tasksOrdered.map((task) => ({
              set_id: problemSetId,
              task_id: task.task_id,
              order: task.order,
            }))
          )
          .returning(["set_id", "task_id", "order"])
          .execute();

  dbProblemSetTasks.sort((a, b) => a.order - b.order);

  const dbTasks =
    tasksOrdered.length <= 0
      ? []
      : await trx
          .selectFrom("tasks")
          .where(
            "id",
            "in",
            dbProblemSetTasks.map((t) => t.task_id)
          )
          .select(["id", "slug", "title"])
          .execute();

  const taskMap = new Map(dbTasks.map((t) => [t.id, t]));
  const taskToOrder = new Map(dbProblemSetTasks.map((t) => [t.task_id, t.order]));

  const dtos: ProblemSetTaskEditorDTO[] = dbProblemSetTasks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    .map((ct, index) => {
      const task = taskMap.get(ct.task_id);
      const order = taskToOrder.get(ct.task_id);
      if (task == null || order == null) {
        return null;
      }
      return {
        task_id: task.id,
        slug: task.slug!,
        title: task.title!,
        order: order,
      };
    })
    .filter(notNull);

  return dtos;
}

async function upsertProblemSetNesteds(
  trx: Transaction<Models>,
  problemSetId: string,
  nesteds: ProblemSetNestedUpdateDTO[]
): Promise<ProblemSetNestedEditorDTO[]> {
  const setsOrdered = makeOrdered(nesteds);
  await trx.deleteFrom("problem_set_nesteds").where("parent_id", "=", problemSetId).execute();

  const dbProblemSetNesteds =
    setsOrdered.length <= 0
      ? []
      : await trx
          .insertInto("problem_set_nesteds")
          .values(
            setsOrdered.map((nested) => ({
              parent_id: problemSetId,
              child_id: nested.child_id,
              order: nested.order,
            }))
          )
          .returning(["parent_id", "child_id", "order"])
          .execute();

  dbProblemSetNesteds.sort((a, b) => a.order - b.order);

  const dbNesteds =
    setsOrdered.length <= 0
      ? []
      : await trx
          .selectFrom("problem_sets")
          .where(
            "id",
            "in",
            dbProblemSetNesteds.map((s) => s.child_id)
          )
          .select(["id", "slug", "title"])
          .execute();

  const nestedMap = new Map(dbNesteds.map((s) => [s.id, s]));
  const nestedToOrder = new Map(dbProblemSetNesteds.map((s) => [s.child_id, s.order]));

  const dtos: ProblemSetNestedEditorDTO[] = dbProblemSetNesteds
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    .map((ct, index) => {
      const nested = nestedMap.get(ct.child_id);
      const order = nestedToOrder.get(ct.child_id);
      if (nested == null || order == null) {
        return null;
      }
      return {
        child_id: nested.id,
        slug: nested.slug!,
        title: nested.title!,
        order: order,
      };
    })
    .filter(notNull);

  return dtos;
}

export async function updateProblemSet(
  problemSet: ProblemSetUpdateDTO
): Promise<ProblemSetEditorDTO> {
  return db.transaction().execute(async (trx): Promise<ProblemSetEditorDTO> => {
    const dbProblemSet = await trx
      .updateTable("problem_sets")
      .set({
        slug: problemSet.slug,
        title: problemSet.title,
        description: problemSet.description,
        is_public: problemSet.is_public,
        order: problemSet.order,
      })
      .where("id", "=", problemSet.id)
      .returning(["id", "slug", "title", "description", "is_public", "order"])
      .executeTakeFirstOrThrow();

    const problemSetTasks = await upsertProblemSetTasks(trx, problemSet.id, problemSet.tasks);
    const problemSetNesteds = await upsertProblemSetNesteds(trx, problemSet.id, problemSet.nesteds);

    return {
      id: dbProblemSet.id,
      slug: dbProblemSet.slug,
      title: dbProblemSet.title,
      description: dbProblemSet.description,
      is_public: dbProblemSet.is_public,
      order: dbProblemSet.order,
      tasks: problemSetTasks,
      nesteds: problemSetNesteds,
    };
  });
}
