"use client";

import { FunctionComponent } from "react";
import Link from "next/link";
import { ProblemSetSummaryDTO } from "common/types";
import { getPath, Path } from "client/paths";
import styles from "./problem_set_card.module.css";

type ProblemSetCardProps = {
  set: ProblemSetSummaryDTO;
};

export const ProblemSetCard: FunctionComponent<ProblemSetCardProps> = ({ set }) => {
  const url = getPath({ kind: Path.ProblemSetView, slug: set.slug });
  return (
    <Link key={set.slug} href={url} className={styles.card}>
      <h2 className="text-2xl mb-1">{set.title}</h2>
      <p className="font-light">
        {set.description ?? "No description was provided for this problem set."}
      </p>
    </Link>
  );
};
