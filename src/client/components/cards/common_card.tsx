"use client";

import Link from "next/link";
import { ContestSummaryDTO, ProblemSetSummaryDTO, TaskSummaryDTO } from "common/types";
import { getPath, Path } from "client/paths";

type CommonCardProps = {
  url: string;
  title: string;
  description: string;
};

export function CommonCard({ url, title, description }: CommonCardProps) {
  return (
    <Link href={url} className="w-[96rem] max-w-full p-4 border border-gray-800 rounded-2xl hover:bg-gray-150">
      <h2 className="text-2xl mb-1">{title}</h2>
      <p className="font-light">
        {description}
      </p>
    </Link>
  );
};


type ProblemSetCardProps = {
  set: ProblemSetSummaryDTO;
};

export function ProblemSetCard({ set }: ProblemSetCardProps) {
  const url = getPath({ kind: Path.ProblemSetView, slug: set.slug });
  return (
    <CommonCard
      key={set.slug}
      url={url}
      title={set.title}
      description={set.description ?? "No description was provided for this problem set."}
    />
  );
};


type ContestCardProps = {
  contest: ContestSummaryDTO;
};

export function ContestCard({ contest }: ContestCardProps) {
  const url = getPath({ kind: Path.ContestView, slug: contest.slug });
  return (
    <CommonCard
      key={contest.slug}
      url={url}
      title={contest.title}
      description={contest.description ?? "No description was provided for this contest."}
    />
  );
};



type TaskCardProps = {
  task: TaskSummaryDTO;
};

export function TaskCard({ task }: TaskCardProps) {
  const url = getPath({ kind: Path.TaskView, slug: task.slug });
  return (
    <CommonCard
      key={task.slug}
      url={url}
      title={task.title}
      description={task.description ?? "No description was provided for this task."}
    />
  );
};
