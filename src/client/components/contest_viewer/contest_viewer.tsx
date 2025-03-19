"use client";

import classNames from "classnames";
import Link from "next/link";
import { memo } from "react";
import { LatexDisplay } from "client/components/latex_display";
import { getPath, Path } from "client/paths";
import { ContestViewerDTO } from "common/types";
import { TaskCard } from "../cards";

type ContestTitleDisplayProps = {
  title: string;
  className?: string;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const ContestViewerTitle = memo(({ title, className }: ContestTitleDisplayProps) => {
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

type ContestEditLinkProps = {
  contestId: string;
  label: string;
};

const ContestEditLink = ({ contestId, label }: ContestEditLinkProps) => {
  const url = getPath({ kind: Path.ContestEdit, uuid: contestId });
  return (
    <Link href={url} className="text-lg font-light px-1 first:pl-0 text-gray-800 ml-auto">
      {label}
    </Link>
  );
};

type ContestViewerProps = {
  contest: ContestViewerDTO;
  canEdit: boolean;
};

export const ContestViewer = ({ contest, canEdit }: ContestViewerProps) => {
  return (
    <>
      <div className="flex items-center">
        <ContestViewerTitle title={contest.title} />
        {canEdit && <ContestEditLink contestId={contest.id} label="Edit" />}
      </div>
      <div className="mt-4">
        {contest.description && <LatexDisplay>{contest.description}</LatexDisplay>}
      </div>
      <div className="flex flex-col items-center gap-4 mt-8">
        {contest.tasks.map((task) => (
          <TaskCard key={task.slug} task={task} />
        ))}
      </div>
    </>
  );
};
