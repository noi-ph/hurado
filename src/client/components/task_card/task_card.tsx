"use client";

import { FunctionComponent } from "react";
import Link from "next/link";
import { TaskSummaryDTO } from "common/types";
import { getPath, Path } from "client/paths";
import styles from "./task_card.module.css";

type TaskCardProps = {
  task: TaskSummaryDTO;
};

export const TaskCard: FunctionComponent<TaskCardProps> = ({ task }) => {
  const url = getPath({ kind: Path.TaskView, slug: task.slug });
  return (
    <Link key={task.slug} href={url} className={styles.card}>
      <h2 className="text-2xl mb-1">{task.title}</h2>
      <p className="font-light">
        {task.description ?? "No description was provided for this task."}
      </p>
    </Link>
  );
};
