import { Task } from "db/types";

export type TaskSummary = Pick<Task, "title" | "slug" | "description">;
