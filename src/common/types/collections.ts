// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { Generated, Insertable, Selectable, Updateable } from "kysely";

export type CollectionTable = {
  id: Generated<string>;
  slug: string;
  title: string;
  description: string | null;
  is_public: boolean;
  order: number;
};

export type CollectionTask = {
  collection_id: string;
  task_id: string;
  order: number;
};
