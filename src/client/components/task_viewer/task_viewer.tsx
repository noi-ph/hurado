"use client";
import { MathJaxContext } from "better-react-mathjax";
import classNames from "classnames";
import { memo, ReactNode, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MathJaxConfig } from "client/components/mathjax";
import { TaskViewerDTO } from "common/types";
import { coerceTaskViewerTab, TaskViewerTab, TaskViewerTabComponent } from "./task_viewer_tabs";
import { TaskViewerStatement } from "./task_viewer_statement";
import { TaskViewerEditorial } from "./task_viewer_editorial";
import { TaskViewerSubmissions } from "./task_viewer_submissions";
import { TaskSubmissionsCache, TaskViewerTitle } from "./task_viewer_utils";

type TaskViewerProps = {
  task: TaskViewerDTO;
};

export const TaskViewer = ({ task }: TaskViewerProps) => {
  const [tab, setTab] = useState(coerceTaskViewerTab(getLocationHash()));
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
          submissions={submissions}
          setSubmissions={setSubmissions}
        />
      );
      break;
    case TaskViewerTab.Editorial:
      content = <TaskViewerEditorial task={task} />;
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
      <div className="max-w-[64rem] mx-auto mt-4">
        <TaskViewerTabComponent className="flex gap-2" tab={tab} />
        {content}
      </div>
    </MathJaxContext>
  );
};

function getLocationHash(): string {
  return typeof window !== "undefined" ? window.location.hash : "";
}
