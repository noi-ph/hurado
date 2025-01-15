"use client";

import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "client/components/navbar";
import {
  CommonEditorFooter,
  CommonEditorPage,
  CommonEditorStatement,
  CommonEditorTabComponent,
  CommonEditorTabItem,
  CommonEditorTitle,
  CommonEditorViewLink,
  getLocationHash,
} from "client/components/common_editor";
import commonStyles from "client/components/common_editor/common_editor.module.css";
import { getPath, Path } from "client/paths";
import { SubmissionsCache } from "client/submissions";
import { TaskDTO } from "common/validation/task_validation";
import { TaskEditorDetails } from "./task_editor_details";
import { TaskEditorJudging } from "./task_editor_judging";
import { TaskEditorSubmissions } from "./task_editor_submissions";
import { saveTask } from "./task_editor_saving";
import { coerceTaskED } from "./coercion";
import { TaskED } from "./types";
import { TaskEditorAdvanced } from "./task_editor_advanced";

type TaskEditorProps = {
  dto: TaskDTO;
};

export const TaskEditor = ({ dto }: TaskEditorProps) => {
  const initialTask = useMemo(() => {
    return coerceTaskED(dto);
  }, [dto]);
  const [tab, setTab] = useState(coerceTaskEditorTab(getLocationHash()));
  const [task, setTask] = useState<TaskED>(initialTask);
  const submissions = useRef(new SubmissionsCache());

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
    case TaskEditorTab.Submissions:
      content = (
        <TaskEditorSubmissions taskId={task.id} cache={submissions.current} />
      );
      break;
    case TaskEditorTab.Advanced:
      content = <TaskEditorAdvanced task={task} setTask={setTask}/>;
      break;
    default:
      content = null;
  }

  // Unfortunately, this thing has to make its own header because it needs to put it in the
  // CSS grid in order to handle overflow scrolling properly in the lower-right corner
  // with OverlayScrollbars. Yeah. The code is scuffed. It's the only place in the world
  // that does this!
  return (
    <CommonEditorPage isStatement={tab === TaskEditorTab.Statement}>
      <Navbar className={commonStyles.header} />
      <CommonEditorTitle title={task.title} slug={task.slug} />
      <TaskEditorTabComponent tab={tab} slug={task.slug} />
      {content}
      <CommonEditorFooter
        object={task}
        setObject={setTask}
        initial={initialTask}
        saveObject={saveTask}
      />
    </CommonEditorPage>
  );
};

type TaskCommonProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export function TaskEditorStatement({ task, setTask }: TaskCommonProps) {
  const setStatement = useCallback(
    (statement: string) => {
      setTask({ ...task, statement });
    },
    [task, setTask]
  );
  return <CommonEditorStatement task={task} statement={task.statement} setStatement={setStatement} />;
}

export enum TaskEditorTab {
  Statement = "statement",
  Details = "details",
  Judging = "judging",
  Submissions = "submissions",
  Advanced = "advanced",
}

type TaskEditorTabProps = {
  tab: TaskEditorTab;
  slug: string;
};

export const TaskEditorTabComponent = memo(({ tab, slug }: TaskEditorTabProps) => {
  const viewURL = getPath({ kind: Path.TaskView, slug: slug });

  return (
    <CommonEditorTabComponent>
      <CommonEditorTabItem tab={TaskEditorTab.Statement} current={tab} label="Statement"/>
      <CommonEditorTabItem tab={TaskEditorTab.Details} current={tab} label="Details"/>
      <CommonEditorTabItem tab={TaskEditorTab.Judging} current={tab} label="Judging"/>
      <CommonEditorTabItem tab={TaskEditorTab.Submissions} current={tab} label="Submissions"/>
      <CommonEditorTabItem tab={TaskEditorTab.Advanced} current={tab} label="Advanced"/>
      <CommonEditorViewLink slug={slug} label="View" url={viewURL} />
    </CommonEditorTabComponent>
  );
});

export function coerceTaskEditorTab(hash: string): TaskEditorTab {
  const split = hash.split("#");
  const real = split.length >= 2 ? split[1] : "";
  switch (real) {
    case TaskEditorTab.Statement:
    case TaskEditorTab.Details:
    case TaskEditorTab.Judging:
    case TaskEditorTab.Submissions:
    case TaskEditorTab.Advanced:
      return real;
    default:
      return TaskEditorTab.Statement;
  }
}