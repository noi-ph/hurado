import classNames from "classnames";
import Link from "next/link";
import { memo, ReactNode, useContext, useEffect } from "react";
import { SubmissionSummaryDTO } from "common/types";
import { humanizeLanguage, humanizeVerdict } from "common/types/constants";
import { uuidToHuradoID } from "common/utils/uuid";
import { humanizeTimeAgo } from "common/utils/dates";
import { getPath, Path } from "client/paths";
import { getVerdictColorClass } from "client/verdicts";
import styles from "./submission_table.module.css";
import { RefreshSubmissionsContext } from "../task_viewer/task_viewer";

type SubmissionTableProps = {
  loaded: boolean;
  submissions: SubmissionSummaryDTO[];
  loadSubmissions(): Promise<void>;
  showUser: boolean;
};

export const SubmissionsTable = ({
  loaded,
  submissions,
  loadSubmissions,
  showUser,
}: SubmissionTableProps) => {
  const {refresh, setRefresh} = useContext(RefreshSubmissionsContext);
  useEffect(() => {
    if (!loaded || refresh) {
      loadSubmissions();
      setRefresh(false);
    }
  }, [submissions]);

  return (
    <div className={classNames(styles.submissions, showUser && styles.showUser)}>
      <SubmissionHeader>#</SubmissionHeader>
      {showUser && <SubmissionHeader>Who</SubmissionHeader>}
      <SubmissionHeader>When</SubmissionHeader>
      <SubmissionHeader>Language</SubmissionHeader>
      <SubmissionHeader>Score</SubmissionHeader>
      {submissions.map((sub) => (
        <SubmissionRow key={sub.id} submission={sub} showUser={showUser} />
      ))}
    </div>
  );
};

type SubmissionRowProps = {
  submission: SubmissionSummaryDTO;
  showUser: boolean;
};

const SubmissionRow = memo(({ submission, showUser }: SubmissionRowProps) => {
  const textVerdict =
    submission.verdict_id == null
      ? "In Queue"
      : submission.verdict == null
        ? "In Progress"
        : humanizeVerdict(submission.verdict, submission.score);

  return (
    <>
      <SubmissionCell className="whitespace-nowrap">
        <Link
          className="text-blue-400 hover:text-blue-500"
          href={getPath({ kind: Path.Submission, uuid: submission.id })}
        >
          {uuidToHuradoID(submission.id)}
        </Link>
      </SubmissionCell>
      {showUser && (
        <SubmissionCell className="whitespace-nowrap">
          {submission.username}
        </SubmissionCell>
      )}
      <SubmissionCell className="whitespace-nowrap">
        {humanizeTimeAgo(submission.created_at)}
      </SubmissionCell>
      <SubmissionCell>{humanizeLanguage(submission.language)}</SubmissionCell>
      <SubmissionCell
        className={classNames("whitespace-nowrap", getVerdictColorClass(submission.verdict))}
      >
        {textVerdict}
      </SubmissionCell>
    </>
  );
});

type SubmissionCellProps = {
  className?: string;
  children?: ReactNode;
};

const SubmissionHeader = memo(({ className, children }: SubmissionCellProps) => {
  return (
    <div
      className={classNames(
        "font-mono font-medium text-xl text-center w-full px-4 py-3 bg-blue-400 text-white",
        className
      )}
    >
      {children}
    </div>
  );
});

const SubmissionCell = memo(({ className, children }: SubmissionCellProps) => {
  return (
    <div
      className={classNames(
        "font-mono text-black text-center w-full px-4 py-3 border-b border-b-black",
        className
      )}
    >
      {children}
    </div>
  );
});
