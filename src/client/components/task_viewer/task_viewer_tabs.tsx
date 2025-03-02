import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { getPath, Path } from "client/paths";
import { useSession } from "client/sessions";

export enum TaskViewerTab {
  Statement = "statement",
  Submissions = "submissions",
  Editorial = "editorial",
}

type TaskEditLinkProps = {
  taskId: string;
  label: string;
};

const TaskEditLink = ({ taskId, label }: TaskEditLinkProps) => {
  const url = getPath({ kind: Path.TaskEdit, uuid: taskId });
  return (
    <Link href={url} className="text-lg font-light px-1 first:pl-0 text-gray-800 ml-auto">
      {label}
    </Link>
  );
};

type TabItemProps = {
  tab: TaskViewerTab;
  current: TaskViewerTab;
  label: string;
};

const TabItem = ({ tab, current, label }: TabItemProps) => {
  const href = `#${tab}`;
  if (current == tab) {
    return (
      <Link href={href} className="text-lg font-bold px-1 first:pl-0 text-gray-800">
        {label}
      </Link>
    );
  } else {
    return (
      <Link href={href} className="text-lg font-light px-1 first:pl-0 text-gray-800">
        {label}
      </Link>
    );
  }
};

type TaskViewerTabProps = {
  className?: string;
  tab: TaskViewerTab;
  taskId: string;
  canEdit: boolean;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const TaskViewerTabComponent = memo(
  ({ className, tab, taskId, canEdit }: TaskViewerTabProps) => {
    const session = useSession();
    const isLoggedIn = session != null && session.user != null;
    return (
      <div className={classNames(className, "flex flex-row justify-start flex-none mb-1gap-2")}>
        <TabItem tab={TaskViewerTab.Statement} current={tab} label="Statement" />
        {isLoggedIn && (
          <TabItem tab={TaskViewerTab.Submissions} current={tab} label="Submissions" />
        )}
        <TabItem tab={TaskViewerTab.Editorial} current={tab} label="Editorial" />
        {canEdit && <TaskEditLink taskId={taskId} label="Edit" />}
      </div>
    );
  }
);

export function coerceTaskViewerTab(hash: string): TaskViewerTab {
  const split = hash.split("#");
  const real = split.length >= 2 ? split[1] : "";
  switch (real) {
    case TaskViewerTab.Statement:
    case TaskViewerTab.Submissions:
    case TaskViewerTab.Editorial:
      return real;
    default:
      return TaskViewerTab.Statement;
  }
}
