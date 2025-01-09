"use client";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TaskViewerDTO } from "common/types";
import { TaskSubmissionsCache } from "client/submissions";
import { coerceTaskViewerTab, TaskViewerTab, TaskViewerTabComponent } from "./task_viewer_tabs";
import { TaskViewerStatement } from "./task_viewer_statement";
import { TaskViewerEditorial } from "./task_viewer_editorial";
import { TaskViewerSubmissions } from "./task_viewer_submissions";

export type RefreshProvidedValue = {
  refresh: boolean,
  setRefresh (refresh: boolean): void,
};
export const RefreshSubmissionsContext = createContext(undefined as unknown as RefreshProvidedValue);

type TaskViewerProps = {
  task: TaskViewerDTO;
  canEdit: boolean;
};

export const TaskViewer = ({ task, canEdit }: TaskViewerProps) => {
  const [tab, setTab] = useState(coerceTaskViewerTab(getLocationHash()));
  const [refresh, setRefresh] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<TaskSubmissionsCache>(
    TaskSubmissionsCache.empty()
  );
  const [isMounted, setIsMounted] = useState(false);

  // NextJS hack to detect when hash changes and run some code
  // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
  const params = useParams();
  useEffect(() => {
    const currentTab = coerceTaskViewerTab(getLocationHash());
    setTab(currentTab);
    setIsMounted(true);
  }, [params]);

  // Hack to skip the hydration error
  if (!isMounted) {
    return null;
  }

  let content: ReactNode = null;
  switch (tab) {
    case TaskViewerTab.Statement:
      content = <TaskViewerStatement task={task} />;
      break;
    case TaskViewerTab.Submissions:
      content = (
        <TaskViewerSubmissions
          task={task}
          cache={submissions}
          setCache={setSubmissions}
        />
      );
      break;
    case TaskViewerTab.Editorial:
      content = <TaskViewerEditorial task={task} />;
      break;
    default:
      content = null;
  }

  return (
    <>
      <RefreshSubmissionsContext.Provider value={{
        refresh,
        setRefresh,
      }}>
        <TaskViewerTabComponent
          className="flex gap-2"
          tab={tab}
          taskId={task.id}
          canEdit={canEdit}
        />
        {content}
      </RefreshSubmissionsContext.Provider>
    </>
  );
};

function getLocationHash(): string {
  return typeof window !== "undefined" ? window.location.hash : "";
}
