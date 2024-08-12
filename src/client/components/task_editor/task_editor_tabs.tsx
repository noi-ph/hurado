import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";

export enum TaskEditorTab {
  Statement = "statement",
  Details = "details",
  Judging = "judging",
  Submissions = "submissions",
}

type TabItemProps = {
  tab: TaskEditorTab;
  current: TaskEditorTab;
  label: string;
};

const TabItem = ({ tab, current, label }: TabItemProps) => {
  const href = `#${tab}`;
  if (current == tab) {
    return <Link href={href} className="text-lg px-1 text-blue-500 border-b-2 border-b-blue-500">{label}</Link>;
  } else {
    return <Link href={href} className="text-lg px-1 text-blue-300 border-b-2 border-b-transparent">{label}</Link>;
  }
};

type TaskEditorTabProps = {
  tab: TaskEditorTab;
  className?: string;
};

export const TaskEditorTabComponent = memo(({ tab, className }: TaskEditorTabProps) => {
  return (
    <div className={classNames(className, "flex flex-row justify-start flex-none mb-1 mx-3 gap-2")}>
      <TabItem tab={TaskEditorTab.Statement} current={tab} label="Statement"/>
      <TabItem tab={TaskEditorTab.Details} current={tab} label="Details"/>
      <TabItem tab={TaskEditorTab.Judging} current={tab} label="Judging"/>
      <TabItem tab={TaskEditorTab.Submissions} current={tab} label="Submissions"/>
    </div>
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
      return real;
    default:
      return TaskEditorTab.Statement;
  }
}
