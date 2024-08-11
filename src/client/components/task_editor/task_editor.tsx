"use client";
import { MouseEvent, ReactNode, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Task } from "common/types";
import styles from "./task_editor.module.css";
import { TaskEditorStatement } from "./task_editor_statement";
import { useParams, usePathname } from "next/navigation";

type TaskEditorProps = {
  task: Task;
};

enum TaskEditorTab {
  Statement = "statement",
  Files = "files",
  Contributors = "contributors",
  Submissions = "submissions",
}

export const TaskEditor = ({ task: initialTask }: TaskEditorProps) => {
  const [tab, setTab] = useState(coerceTaskEditorTab(window.location.hash));
  const [task, setTask] = useState(initialTask);

  // NextJS hack to detect when hash changes and run some code
  // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
  const params = useParams();
  useEffect(() => {
    const currentTab = coerceTaskEditorTab(window.location.hash);
    setTab(currentTab);
  }, [params]);

  let content: ReactNode = null;
  switch (tab) {
    case TaskEditorTab.Statement:
      content = <TaskEditorStatement task={task} setTask={setTask} />;
      break;
    default:
      content = null;
  }

  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className="">{task.title}</div>
        <div className="">{task.slug}</div>
      </div>
      <div className="flex flex-row justify-start">
        <Link href={`#${TaskEditorTab.Statement}`}>
          Statement
        </Link>
        <Link href={`#${TaskEditorTab.Files}`}>
          Files
        </Link>
        <Link href={`#${TaskEditorTab.Contributors}`}>
          Contributors
        </Link>
        <Link href={`#${TaskEditorTab.Submissions}`}>
          Submissions
        </Link>
      </div>
      <div className="content">{content}</div>
    </div>
  );
};

function coerceTaskEditorTab(hash: string): TaskEditorTab {
  const split = hash.split("#");
  const real = split.length >= 2 ? split[1] : "";
  switch (real) {
    case TaskEditorTab.Statement:
    case TaskEditorTab.Files:
    case TaskEditorTab.Contributors:
    case TaskEditorTab.Submissions:
      return real;
    default:
      return TaskEditorTab.Statement;
  }
}
