"use client";

import { FunctionComponent } from "react";
import Link from "next/link";
import { ContestSummaryDTO } from "common/types";
import { getPath, Path } from "client/paths";
import styles from "./contest_card.module.css";

type ContestCardProps = {
  contest: ContestSummaryDTO;
};

export const ContestCard: FunctionComponent<ContestCardProps> = ({ contest }) => {
  const url = getPath({ kind: Path.ContestView, slug: contest.slug });
  return (
    <Link key={contest.slug} href={url} className={styles.card}>
      <h2 className="text-2xl mb-1">{contest.title}</h2>
      <p className="font-light">
        {contest.description ?? "No description was provided for this contest."}
      </p>
    </Link>
  );
};
