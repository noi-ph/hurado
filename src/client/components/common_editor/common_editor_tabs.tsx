import classNames from "classnames";
import Link from "next/link";
import { memo, ReactNode } from "react";
import styles from './common_editor.module.css';

type CommonEditorViewLinkProps = {
  slug: string;
  label: string;
  url: string;
};

export const CommonEditorViewLink = ({ url, label }: CommonEditorViewLinkProps) => {
  return (
    <Link href={url} className="text-lg px-1 text-blue-300 border-b-2 border-b-transparent ml-auto">
      {label}
    </Link>
  );
};

type TabItemProps<T> = {
  tab: T;
  current: T;
  label: string;
};

export function CommonEditorTabItem<T>({ tab, current, label }: TabItemProps<T>) {
  const href = `#${tab}`;
  if (current == tab) {
    return <Link href={href} className="text-lg px-1 text-blue-500 border-b-2 border-b-blue-500">{label}</Link>;
  } else {
    return <Link href={href} className="text-lg px-1 text-blue-300 border-b-2 border-b-transparent">{label}</Link>;
  }
};

type CommonEditorTabProps = {
  children: ReactNode;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const CommonEditorTabComponent = memo(({ children }: CommonEditorTabProps) => {
  return (
    <div className={classNames(styles.tabs, "flex flex-row justify-start flex-none mb-1 mx-3 gap-2")}>
      {children}
    </div>
  );
});
