"use client";
import { MathJaxContext } from "better-react-mathjax";
import classNames from "classnames";
import { memo, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "client/components/navbar";
import layoutStyles from "client/components/layouts/layout.module.css";
import { MathJaxConfig } from "client/components/mathjax";
import { TaskEditorStatement } from "./task_editor_statement";
import styles from "./task_editor.module.css";
import { coerceTaskEditorTab, TaskEditorTab, TaskEditorTabComponent } from "./task_editor_tabs";
import { TaskEditorDetails } from "./task_editor_details";
import { TaskSSR } from "common/types";
import { coerceTaskED } from "./coercion";
import { TaskED } from "./types";
import { TaskEditorJudging } from "./task_editor_judging";
import { saveTask } from "./task_editor_saving";

type TaskEditorProps = {
  ssr: TaskSSR;
};

export const TaskEditor = ({ ssr }: TaskEditorProps) => {
  const initialTask = useMemo(() => {
    return coerceTaskED(ssr);
  }, [ssr])
  const [tab, setTab] = useState(coerceTaskEditorTab(getLocationHash()));
  const [task, setTask] = useState<TaskED>(initialTask);
  const [isMounted, setIsMounted] = useState(false);

  // NextJS hack to detect when hash changes and run some code
  // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
  const params = useParams();
  useEffect(() => {
    const currentTab = coerceTaskEditorTab(getLocationHash());
    setTab(currentTab);
    setIsMounted(true);
  }, [params]);

  // Hack to skip the hydration error
  if (!isMounted) {
    return null;
  }

  let content: ReactNode = null;
  switch (tab) {
    case TaskEditorTab.Statement:
      content = <TaskEditorStatement task={task} setTask={setTask} />;
      break;
    case TaskEditorTab.Details:
      content = <TaskEditorDetails task={task} setTask={setTask} />;
      break;
    case TaskEditorTab.Judging:
      content = <TaskEditorJudging task={task} setTask={setTask} />;
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
        <TaskEditorFooter task={task} setTask={setTask} initial={initialTask} />
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
        {title || "Title"}
      </div>
      <div className={classNames("font-mono text-2xl", slug ? "text-gray-500" : "text-gray-300")}>
        {slug || "Slug"}
      </div>
    </div>
  );
});

type TaskEditorFooterProps = {
  initial: TaskED;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskEditorFooter = memo(({ task, setTask, initial }: TaskEditorFooterProps) => {
  const [saving, setSaving] = useState(false);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const newTask = await saveTask(task);
      setTask(newTask);
      alert('We did it!');
    } finally {
      setSaving(false);
    }
  }, [task]);

  return (
    <div
      className={classNames(
        styles.footer,
        "flex flex-row justify-end px-4 py-2 border-t border-gray-300"
      )}
    >
      <button
        disabled={task === initial || saving}
        onClick={handleSave}
        className="py-2 px-4 rounded font-bold text-white bg-blue-300 enabled:hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-default"
      >
        Save Changes
      </button>
    </div>
  );
});

function getLocationHash(): string {
  return typeof window !== "undefined" ? window.location.hash : '';
}
