"use client";

import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { LatexDisplay } from "client/components/latex_display";
import { getPath, Path } from "client/paths";
import { ProblemSetViewerDTO } from "common/types";
import { TaskCard } from "../cards";

type ProblemSetTitleDisplayProps = {
  title: string;
  className?: string;
};

export const ProblemSetViewerTitle = memo(({ title, className }: ProblemSetTitleDisplayProps) => {
  return (
    <div
      className={classNames(
        "font-sans font-bold text-4xl mt-2 mb-4 flex-auto",
        title ? "text-blue-400" : "text-gray-300",
        className
      )}
    >
      {title || "Title"}
    </div>
  );
});

type ProblemSetEditLinkProps = {
  id: string;
  label: string;
};

const ProblemSetEditLink = ({ id, label }: ProblemSetEditLinkProps) => {
  const url = getPath({ kind: Path.ProblemSetEdit, uuid: id });
  return (
    <Link href={url} className="text-lg font-light px-1 first:pl-0 text-gray-800 ml-auto">
      {label}
    </Link>
  );
};

type ProblemSetViewerProps = {
  set: ProblemSetViewerDTO;
  canEdit: boolean;
};

export const ProblemSetViewer = ({ set, canEdit }: ProblemSetViewerProps) => {
  return (
    <>
      <div className="flex items-center">
        <ProblemSetViewerTitle title={set.title} />
        {canEdit && <ProblemSetEditLink id={set.id} label="Edit" />}
      </div>
      <div className="mt-4">
        {set.description && <LatexDisplay>{set.description}</LatexDisplay>}
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        {set.tasks.map(task => <TaskCard key={task.slug} task={task}/>)}
      </div>
    </>
  );
};
