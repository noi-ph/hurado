"use client";
import { MathJaxContext } from "better-react-mathjax";
import classNames from "classnames";
import { memo, ReactNode, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "client/components/navbar";
import layoutStyles from "client/components/layouts/layout.module.css";
import { MathJaxConfig } from "client/components/mathjax";
import { TaskEditorTask } from "common/types";
import { TaskEditorStatement } from "./task_editor_statement";
import styles from "./task_editor.module.css";
import { coerceTaskEditorTab, TaskEditorTab, TaskEditorTabComponent } from "./task_editor_tabs";
import { TaskEditorDetails } from "./task_editor_details";

type TaskEditorProps = {
  task: TaskEditorTask;
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
    case TaskEditorTab.Details:
      content = <TaskEditorDetails task={task} setTask={setTask} />;
      break;
    default:
      content = null;
  }

  // Unfortunately, this thing has to make its own header because it needs to put it in the
  // CSS grid in order to handle overflow scrolling properly in the lower-right corner
  // with OverlayScrollbars. Yeah. The code is scuffed. It's the only place in the world
  // that does this!
  return (
    <MathJaxContext config={MathJaxConfig}>
      <div
        className={classNames(styles.main, tab === TaskEditorTab.Statement && styles.isStatement)}
      >
        <header className={classNames(styles.header, layoutStyles.header)}>
          <Navbar />
        </header>
        <TaskTitleDisplay title={task.title} slug={task.slug} />
        <TaskEditorTabComponent className={styles.tabs} tab={tab} />
        {content}
      </div>
    </MathJaxContext>
  );
};

type TaskTitleDisplayProps = {
  title: string;
  slug: string;
};

const TaskTitleDisplay = memo(({ title, slug }: TaskTitleDisplayProps) => {
  return (
    <div className={classNames(styles.title, "flex flex-row justify-between mx-4")}>
      <div className={classNames("font-sans text-2xl", title ? "text-black" : "text-gray-300")}>
        {title || 'Title'}
      </div>
      <div className={classNames("font-mono text-2xl", slug ? "text-gray-500" : "text-gray-300")}>
        {slug || 'Slug'}
      </div>
    </div>
  );
});
