"use client";

import { FunctionComponent } from "react";
import Link from "next/link";
import { Task } from "lib/models";
import styles from "./index.module.css";

type TaskCardProps = {
  task: Task;
};

export const TaskCard: FunctionComponent<TaskCardProps> = ({ task }) => (
  <Link
    key={task.slug}
    href={`/tasks/${task.slug}`}
    className={styles.container}
  >
    <h2>{task.title}</h2>
    <p>{task.description ?? "No description was provided for this task."}</p>
  </Link>
);
