import { z } from "zod";
import { ProblemSet } from "common/types";
import { REGEX_SLUG } from "./common_validation";

export type ProblemSetTaskUpdateDTO = z.infer<typeof zProblemSetTask>;
export type ProblemSetUpdateDTO = z.infer<typeof zProblemSet>;

const zProblemSetTask = z.object({
  task_id: z.string().uuid(),
  order: z.number(),
});

export const zProblemSet = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).regex(REGEX_SLUG),
  title: z.string().min(1),
  description: z.string(),
  is_public: z.boolean(),
  order: z.number().int(),
  tasks: z.array(zProblemSetTask),
});

type ProblemSetEditorKeys = "id" | "slug" | "title" | "description" | "is_public" | "order";

export type ProblemSetTaskEditorDTO = {
  task_id: string;
  slug: string;
  title: string;
  order: number;
};

export type ProblemSetEditorDTO = Pick<ProblemSet, ProblemSetEditorKeys> & {
  tasks: ProblemSetTaskEditorDTO[];
};

export const zProblemSetCreate = zProblemSet.pick({
  slug: true,
  title: true,
});
