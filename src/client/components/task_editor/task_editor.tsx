"use client";
import { ReactNode, useEffect, useState } from "react";
import { Task } from "common/types";
import { TaskEditorStatement } from "./task_editor_statement";
import { useParams } from "next/navigation";
import { MathJaxContext } from "better-react-mathjax";
import { MathJaxConfig } from "../mathjax";
import { Navbar } from "client/components/navbar";
import classNames from "classnames";
import styles from "./task_editor.module.css";
import layoutStyles from "client/components/layouts/layout.module.css";
import { coerceTaskEditorTab, TaskEditorTab, TaskEditorTabComponent } from "./task_editor_tabs";


type TaskEditorProps = {
  task: Task;
};

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
    <MathJaxContext config={MathJaxConfig}>
      <body className={styles.page}>
        <div
          className={classNames(styles.main, tab === TaskEditorTab.Statement && styles.isStatement)}
        >
          <header className={classNames(styles.header, layoutStyles.header)}>
            <Navbar />
          </header>
          <TaskTitleDisplay title={task.title} slug={task.slug}/>
          <TaskEditorTabComponent className={styles.tabs} tab={tab} />
          {content}
        </div>
      </body>
    </MathJaxContext>
  );
};

type TaskTitleDisplayProps = {
  title: string;
  slug: string;
};

function TaskTitleDisplay({ title, slug }: TaskTitleDisplayProps) {
  return (
    <div className={classNames(styles.title, "flex flex-row justify-between mx-4")}>
      <div className={classNames("font-sans text-2xl", title ? 'text-black' : 'text-gray-200')}>{title}</div>
      <div className={classNames("font-mono text-2xl", slug ? 'text-gray-500' : 'text-gray-200')}>{slug}</div>
    </div>
  );
}
