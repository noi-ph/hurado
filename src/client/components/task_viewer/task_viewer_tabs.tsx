import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";

export enum TaskViewerTab {
  Statement = "statement",
  Submissions = "submissions",
  Editorial = "editorial",
}

type TabItemProps = {
  tab: TaskViewerTab;
  current: TaskViewerTab;
  label: string;
};

const TabItem = ({ tab, current, label }: TabItemProps) => {
  const href = `#${tab}`;
  if (current == tab) {
    return <Link href={href} className="text-lg font-bold px-1 first:pl-0 text-gray-800">{label}</Link>;
  } else {
    return <Link href={href} className="text-lg font-light px-1 first:pl-0 text-gray-800">{label}</Link>;
  }
};

type TaskViewerTabProps = {
  tab: TaskViewerTab;
  className?: string;
};

export const TaskViewerTabComponent = memo(({ tab, className }: TaskViewerTabProps) => {
  return (
    <div className={classNames(className, "flex flex-row justify-start flex-none mb-1gap-2")}>
      <TabItem tab={TaskViewerTab.Statement} current={tab} label="Statement"/>
      <TabItem tab={TaskViewerTab.Submissions} current={tab} label="Submissions"/>
      <TabItem tab={TaskViewerTab.Editorial} current={tab} label="Editorial"/>
    </div>
  );
});

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
