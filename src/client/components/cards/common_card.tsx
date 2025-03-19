"use client";

import Link from "next/link";
import classNames from "classnames";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import {
  ContestSummaryDTO,
  ProblemSetSummaryDTO,
  TaskScoredSummaryDTO,
  TaskSummaryDTO,
} from "common/types";
import { getPath, Path } from "client/paths";

type CommonCardProps = {
  url: string;
  title: string;
  description: string;
};

export function CommonCard({ url, title, description }: CommonCardProps) {
  return (
    <Link
      href={url}
      className="w-[96rem] max-w-full p-4 border border-gray-800 rounded-2xl hover:bg-gray-150"
    >
      <h2 className="text-2xl mb-1">{title}</h2>
      <p className="font-light">{description}</p>
    </Link>
  );
}

type ProblemSetCardProps = {
  set: ProblemSetSummaryDTO;
};

export function ProblemSetCard({ set }: ProblemSetCardProps) {
  const url = getPath({ kind: Path.ProblemSetView, slug: set.slug });
  return (
    <Link
      key={set.slug}
      href={url}
      className="w-[96rem] max-w-full p-4 border border-gray-800 rounded-2xl hover:bg-gray-150"
    >
      <h2 className="text-2xl mb-1">{set.title}</h2>
      <p className="font-light">
        {set.description ?? "No description was provided for this problem set."}
      </p>
    </Link>
  );
}

type ContestCardProps = {
  contest: ContestSummaryDTO;
};

export function ContestCard({ contest }: ContestCardProps) {
  const url = getPath({ kind: Path.ContestView, slug: contest.slug });
  return (
    <Link
      key={contest.slug}
      href={url}
      className="w-[96rem] max-w-full p-4 border border-gray-800 rounded-2xl hover:bg-gray-150"
    >
      <h2 className="text-2xl mb-1">{contest.title}</h2>
      <p className="font-light">
        {contest.description ?? "No description was provided for this contest."}
      </p>
    </Link>
  );
}

type TaskCardProps = {
  task: TaskScoredSummaryDTO;
};

export function TaskCard({ task }: TaskCardProps) {
  const url = getPath({ kind: Path.TaskView, slug: task.slug });

  let top_class =
    "p-[1rem] border-t border-l border-r border-black rounded-tl-2xl rounded-tr-2xl group-hover:bg-gray-150";
  const bottom_class =
    "p-0 bg-[#cccccc] border-l border-r border-b border-black rounded-bl-2xl rounded-br-2xl overflow-hidden";
  let pbar_class = "p-[0.25rem]";
  let pbar_style = {};

  if (task.score_overall == null || task.score_max == null) {
    // no attempts
    pbar_style = {
      "width": "0%",
    };
  } else if (task.score_overall == 0 || task.score_max == 0) {
    // has attempts, binary score
    pbar_class = classNames(pbar_class, "w-full bg-yellow-800");
    pbar_style = {
      "width": "100%",
    };
  } else {
    // partial score or accepted
    pbar_class = classNames(pbar_class, `bg-green-400`);
    pbar_style = {
      // this computed value isn't a literal that can be parsed by tailwind, so it has to be a separate thing
      width: `${Math.max(0, Math.min(100, Math.floor((task.score_overall / task.score_max) * 100)))}%`,
    };
    if (task.score_overall == task.score_max) {
      top_class = classNames(top_class, "bg-green-100 group-hover:bg-green-200");
    }
  }
  return (
    <Link className="w-[96rem] max-w-full group" key={task.slug} href={url}>
      <div className={top_class}>
        <h2 className="text-2xl mb-1">{task.title}</h2>
        <p className="font-light">
          {task.description ?? "No description was provided for this task."}
        </p>
      </div>
      <div className={bottom_class}>
        <div className={pbar_class} style={pbar_style}></div>
      </div>
    </Link>
  );
}
