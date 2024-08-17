import { TaskViewerDTO } from "common/types";
import { TaskSubmissionsCache, TaskViewerTitle } from "./task_viewer_utils";
import styles from "./task_viewer.module.css";
import { memo, ReactNode, useEffect } from "react";
import { SubmissionSummaryDTO } from "common/types/submissions";
import { humanizeTimeAgo } from "common/utils/dates";
import { huradoIDToUUID, uuidToHuradoID } from "common/utils/uuid";
import { getPath, Path } from "client/paths";
import Link from "next/link";

type TaskViewerSubmissionsProps = {
  task: TaskViewerDTO;
  submissions: TaskSubmissionsCache;
  setSubmissions(cache: TaskSubmissionsCache): void;
};

export const TaskViewerSubmissions = ({
  task,
  submissions,
  setSubmissions,
}: TaskViewerSubmissionsProps) => {
  return (
    <div>
      <TaskViewerTitle title={task.title} />
      <SubmissionsTable task={task} submissions={submissions} setSubmissions={setSubmissions} />
    </div>
  );
};

const SubmissionsTable = ({ task, submissions, setSubmissions }: TaskViewerSubmissionsProps) => {
  useEffect(() => {
    if (!submissions.loaded) {
      TaskSubmissionsCache.load(task.id).then((next) => {
        setSubmissions(next);
      });
    }
  }, [submissions]);

  if (!submissions.loaded) {
    // TODO(Bonus): Put a loading thing here
    return null;
  }

  return (
    <div className={styles.submissions}>
      <SubmissionHeader>#</SubmissionHeader>
      <SubmissionHeader>When</SubmissionHeader>
      <SubmissionHeader>Language</SubmissionHeader>
      <SubmissionHeader>Score</SubmissionHeader>
      <SubmissionHeader>Time</SubmissionHeader>
      <SubmissionHeader>Memory</SubmissionHeader>
      {submissions.submissions.map((sub) => (
        <SubmissionRow key={sub.id} submission={sub} />
      ))}
    </div>
  );
};

type SubmissionRowProps = {
  submission: SubmissionSummaryDTO;
};

const SubmissionRow = memo(({ submission }: SubmissionRowProps) => {
  return (
    <>
      <SubmissionCell>
        <Link
          className="text-blue-400 hover:text-blue-500"
          href={getPath({ kind: Path.Submission, uuid: submission.id })}
        >
          {uuidToHuradoID(submission.id)}
        </Link>
      </SubmissionCell>
      <SubmissionCell>{humanizeTimeAgo(submission.created_at)}</SubmissionCell>
      <SubmissionCell>{submission.language}</SubmissionCell>
      <SubmissionCell>In Queue {submission.verdict}</SubmissionCell>
      <SubmissionCell></SubmissionCell>
      <SubmissionCell></SubmissionCell>
    </>
  );
});

type HasChildrenProps = {
  children?: ReactNode;
};

const SubmissionHeader = memo(({ children }: HasChildrenProps) => {
  return (
    <div className="font-mono font-medium text-xl text-center w-full px-4 py-3 bg-blue-400 text-white">
      {children}
    </div>
  );
});

const SubmissionCell = memo(({ children }: HasChildrenProps) => {
  return (
    <div className="font-mono text-black text-center w-full px-4 py-3 border-b border-b-black">
      {children}
    </div>
  );
});
