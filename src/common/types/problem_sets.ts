import { Generated, Insertable, Selectable, Updateable } from "kysely";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { TaskScoredSummaryDTO, TaskSummaryDTO } from "./tasks";

export type ProblemSetTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description: string;
  is_public: boolean;
  order: number;
};

export type ProblemSetTaskTable = {
  set_id: string;
  task_id: string;
  order: number;
};

export type ProblemSet = Selectable<ProblemSetTable>;
export type ProblemSetCreate = Insertable<ProblemSetTable>;
export type ProblemSetUpdate = Updateable<ProblemSetTable>;

export type ProblemSetViewerDTO = {
  id: string;
  slug: string;
  title: string;
  description: string;
  is_public: boolean;
  order: number;
  tasks: TaskScoredSummaryDTO[];
};

export type ProblemSetSummaryDTO = {
  slug: string;
  title: string;
  description: string;
  order: number;
};
