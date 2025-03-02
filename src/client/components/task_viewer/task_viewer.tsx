"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { TaskViewerDTO } from "common/types";
import { SubmissionsCacheContext, SubmissionsCache } from "client/submissions";
import { coerceTaskViewerTab, TaskViewerTab, TaskViewerTabComponent } from "./task_viewer_tabs";
import { TaskViewerStatement } from "./task_viewer_statement";
import { TaskViewerEditorial } from "./task_viewer_editorial";
import { TaskViewerSubmissions } from "./task_viewer_submissions";


type TaskViewerProps = {
  task: TaskViewerDTO;
  canEdit: boolean;
  clearSubmissionsCache?(): void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
export const TaskViewer = ({ task, canEdit, clearSubmissionsCache }: TaskViewerProps) => {
  const submissions = useRef(new SubmissionsCache());
  const [tab, setTab] = useState(coerceTaskViewerTab(getLocationHash()));
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
        <TaskViewerSubmissions task={task} cache={submissions.current} />
      );
      break;
    case TaskViewerTab.Editorial:
      content = <TaskViewerEditorial task={task} />;
      break;
    default:
      content = null;
  }

  return (
    <SubmissionsCacheContext.Provider value={submissions.current}>
      <TaskViewerTabComponent
        className="flex gap-2"
        tab={tab}
        taskId={task.id}
        canEdit={canEdit}
      />
      {content}
    </SubmissionsCacheContext.Provider>
  );
};

function getLocationHash(): string {
  return typeof window !== "undefined" ? window.location.hash : "";
}
