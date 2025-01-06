import { Generated, Insertable, Selectable, Updateable } from "kysely";
import { TaskSummaryDTO } from "./tasks";

export type ProblemSetTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description: string | null;
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
  description: string | null;
  is_public: boolean;
  order: number;
  tasks: TaskSummaryDTO[];
};

export type ProblemSetSummaryDTO = {
  slug: string;
  title: string;
  description: string | null;
  order: number;
};
