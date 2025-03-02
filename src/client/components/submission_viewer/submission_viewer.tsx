"use client";

import classNames from "classnames";
import type { editor } from "monaco-editor";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { useCallback, useContext, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  SubmissionViewerDTO,
  SubmissionViewerFileDTO,
  VerdictSubtaskViewerDTO,
  VerdictTaskDataViewerDTO,
} from "common/types";
import { humanizeLanguage, humanizeVerdict, TaskType, Verdict } from "common/types/constants";
import { formatDateTime, humanizeTimeAgo } from "common/utils/dates";
import { notNull } from "common/utils/guards";
import { uuidToHuradoID } from "common/utils/uuid";
import BoxIcon from "client/components/box_icon";
import { getPath, Path } from "client/paths";
import { getVerdictColorClass } from "client/verdicts";
import { SubmissionsCacheContext } from "client/submissions";
import { rejudgeSubmission } from "../submit_panel/submit_utils";
import button_styles from "../submit_panel/submit_panel.module.css";
type SubmissionViewerProps = {
  submission: SubmissionViewerDTO;
};

const MonacoOptions: editor.IStandaloneEditorConstructionOptions = Object.freeze({
  readOnly: true,
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
});

const CodeEditorMinimumHeight = 72;

export const SubmissionViewer = ({ submission, isAdmin }: SubmissionViewerProps & { isAdmin: boolean }) => {
  const baseTaskURL = getPath({ kind: Path.TaskView, slug: submission.task.slug });
  const taskURL = `${baseTaskURL}`;
  const submissionsURL = `${baseTaskURL}#submissions`;

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row lg:items-end mt-2 mb-4">
        <Link
          href={taskURL}
          className="flex items-center font-sans font-bold text-4xl text-blue-400 w-fit"
        >
          <BoxIcon name="bx-chevron-left" className="bx-lg" />
          {submission.task.title}
        </Link>
        <div className="flex flex-row justify-between flex-wrap lg:flex-col lg:justify-start lg:items-end my-4 lg:my-0 lg:ml-auto">
          <Link href={submissionsURL} className="text-blue-400 hover:text-blue-500 mr-4">
            My Submissions
          </Link>
          <div className="text-gray-300 whitespace-nowrap">
            {uuidToHuradoID(submission.id)}
          </div>
        </div>
      </div>
      <RejudgeButton submission={submission} isAdmin={isAdmin}/>
      <SubmissionVerdictSummary submission={submission} />
      {submission.verdict != null ? (
        <>
          <div className="text-2xl mt-3 mb-2">Judgement Details</div>
          <SubmissionVerdictViewer submission={submission} />
        </>
      ) : null}
      {(submission.task.type === TaskType.Batch ||
        submission.task.type === TaskType.Communication) && (
        <>
          <div className="text-2xl mt-3 mb-2">Submitted Code</div>
          <SubmissionCodeViewer submission={submission} />
        </>
      )}
      {submission.task.type === TaskType.OutputOnly && (
        <>
          <div className="text-2xl mt-3 mb-2">Submitted Output</div>
          {submission.files.map((file, idx) => (
            <SubmissionOutputViewer key={idx} file={file} />
          ))}
        </>
      )}
    </>
  );
};

const SubmissionVerdictSummary = ({ submission }: SubmissionViewerProps) => {
  let status: React.ReactNode;
  if (submission.verdict == null) {
    status = <span className="font-semibold">In Queue</span>;
  } else if (submission.verdict.verdict == null) {
    status = <span className="font-semibold text-blue-500">In Progress</span>;
  } else {
    status = (
      <span
        className={classNames("font-semibold", getVerdictColorClass(submission.verdict.verdict))}
      >
        {humanizeVerdict(submission.verdict.verdict, null)}
      </span>
    );
  }

  let score: React.ReactNode = null;
  if (submission.verdict != null) {
    const max = submission.verdict.score_max;
    const raw = submission.verdict.score_raw;

    if (max != null && raw != null) {
      score = (
        <div className="ml-4">
          Score:{" "}
          <span className={classNames("font-medium", getScoreClassName(raw, max))}>
            {raw}/{max}
          </span>
        </div>
      );
    }
  }

  return (
    <div className="flex text-lg">
      <div>Status: {status}</div>
      {score}
      <div className="ml-auto">
        Submitted:{" "}
        <span title={formatDateTime(submission.created_at)} suppressHydrationWarning>
          {humanizeTimeAgo(submission.created_at)}
        </span>
      </div>
    </div>
  );
};

const SubmissionVerdictViewer = ({ submission }: SubmissionViewerProps) => {
  if (submission.verdict == null) {
    return null;
  }
  return (
    <div>
      {submission.verdict.subtasks.map((subtask, subtaskIndex) => (
        <SubtaskVerdictViewer key={subtaskIndex} subtaskIndex={subtaskIndex} subtask={subtask} />
      ))}
    </div>
  );
};

type SubtaskVerdictViewerProps = {
  subtaskIndex: number;
  subtask: VerdictSubtaskViewerDTO;
};

const SubtaskVerdictViewer = ({ subtask, subtaskIndex }: SubtaskVerdictViewerProps) => {
  let score: React.ReactNode;
  if (subtask.score_max != null && subtask.score_raw != null) {
    const max = subtask.score_max;
    const raw = subtask.score_raw;
    score = (
      <span className={classNames("font-medium", getScoreClassName(raw, max))}>
        {raw}/{max}
      </span>
    );
  } else {
    score = <span className="font-medium">N/A</span>;
  }

  const running_times = subtask.data.some(data => data.running_time_ms == null) ? [] : subtask.data.map(data => data.running_time_ms).filter(notNull);
  const worst = running_times.length == 0 ? null : running_times.reduce((a, b) => Math.max(a, b));

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center px-4 py-2 rounded-t-lg bg-blue-300">
        <div className="text-lg">Subtask #{subtaskIndex + 1}</div>
        <div className="ml-auto flex flex-row gap-4">
          {
            worst == null
              ? null
              : (
                <div>
                  Time: {
                    worst < 1000
                      ? `${worst} ms`
                      : `${worst/1000} s`
                  }
                </div>
              )
          }
          <div>
            Score: {score}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 px-4 py-2 border border-t-0 border-gray-300 rounded-b-lg">
        {subtask.data.map((data, dataIndex) => (
          <TaskDataVerdictViewer key={dataIndex} data={data} dataIndex={dataIndex} />
        ))}
      </div>
    </div>
  );
};

type TaskDataVerdictViewerProps = {
  dataIndex: number;
  data: VerdictTaskDataViewerDTO;
};

const TaskDataVerdictViewer = ({ data, dataIndex }: TaskDataVerdictViewerProps) => {
  let iconName = "";
  switch (data.verdict) {
    case Verdict.Accepted:
    case Verdict.Partial:
      iconName = "bx-check";
      break;
    case Verdict.WrongAnswer:
      iconName = "bx-x";
      break;
    case Verdict.RuntimeError:
      iconName = "bx-error-circle";
      break;
    case Verdict.MemoryLimitExceeded:
      iconName = "bx-chip";
      break;
    case Verdict.TimeLimitExceeded:
      iconName = "bx-time-five";
      break;
    case Verdict.Skipped:
      iconName = "bx-skip-next-circle";
      break;
    default:
      iconName = "bx-hourglass";
      break;
  }

  const hVerdict = data.verdict != null ? humanizeVerdict(data.verdict, null) : "Pending";
  const hRuntime = data.running_time_ms != null ? `Time: ${data.running_time_ms}ms` : null;
  const hMemory = data.running_memory_byte != null ? `Memory: ${data.running_memory_byte}b` : null;
  const hoverText = [hVerdict, hRuntime, hMemory].filter(notNull).join("\n");

  return (
    <div className="flex items-center">
      <span className="inline-flex items-center cursor-pointer" title={hoverText}>
        <BoxIcon name={iconName} className={getVerdictIconClassName(data.verdict)} />
        Test Case #{dataIndex + 1}
      </span>
    </div>
  );
};

const SubmissionCodeViewer = ({ submission }: SubmissionViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Magic code that resizes the editor, mostly stolen from:
  // https://github.com/microsoft/monaco-editor/issues/794#issuecomment-427092969
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
  const onEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    if (containerRef.current == null) {
      return;
    }

    editorRef.current = editor;

    const el = containerRef.current;
    const codeContainer = el.getElementsByClassName("view-lines")[0] as HTMLElement;

    requestAnimationFrame(() => {
      const height = Math.max(CodeEditorMinimumHeight, codeContainer.offsetHeight);
      el.style.height = height + "px";
      editor.layout();
    });
  }, []);

  if (submission.files.length == 0) {
    return null;
  }

  const file = submission.files[0];
  if (file.content == null) {
    return <div>Code could not be found on the server.</div>;
  }

  return (
    <div className="border border-gray-300">
      <div className="flex px-5 py-3 font-light box-border border-b border-gray-300">
        Language: {humanizeLanguage(submission.language)}
      </div>
      <div ref={containerRef}>
        <MonacoEditor
          value={file.content ?? ""}
          options={MonacoOptions}
          theme="light"
          onMount={onEditorMount}
        />
      </div>
    </div>
  );
};

type SubmissionOutputViewerProps = {
  file: SubmissionViewerFileDTO;
};

const SubmissionOutputViewer = ({ file }: SubmissionOutputViewerProps): React.ReactNode => {
  const title = file.subtask == null ? "Subtask #?" : `Subtask #${file.subtask}`;
  const content = file.content == null ? "Code could not be found on the server." : file.content;
  return (
    <div className="mt-3">
      <div className="text-lg mb-1">{title}</div>
      <pre className="space-mono p-2 border border-gray-300 bg-gray-200">{content}</pre>
    </div>
  );
};


export const RejudgeButton = ({ submission, isAdmin }: SubmissionViewerProps & { isAdmin: boolean }) => {
  if (!isAdmin) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  const [rejudging, setRejudging] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  const submissions = useContext(SubmissionsCacheContext);

  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  const rejudge = useCallback(async () => {
    if (rejudging) {
      return;
    }
    setRejudging(true);
    await rejudgeSubmission(submission.id, submissions, router);
    toast.info('This submission will be rejudged...');
    if (submissions) {
      submissions.clear();
    }
    router.refresh();
    router.push(getPath({ kind: Path.Submission, uuid: submission.id }));

    setRejudging(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, []);

  return (

    <button type="submit" className={button_styles.button} onClick={rejudge} disabled={rejudging}>
      Rejudge
    </button>
  );
};

function getScoreClassName(raw: number, max: number): string | undefined {
  if (raw == max) {
    return "text-green-500";
  } else if (raw > 0) {
    return "text-yellow-900";
  } else {
    return undefined;
  }
}

function getVerdictIconClassName(verdict: Verdict | null): string | undefined {
  switch (verdict) {
    case Verdict.Accepted:
      return "bx-sm text-green-500";
    case Verdict.Partial:
      return "bx-sm text-yellow-900";
    case Verdict.WrongAnswer:
    case Verdict.RuntimeError:
    case Verdict.TimeLimitExceeded:
    case Verdict.MemoryLimitExceeded:
      return "bx-sm text-red-500";
    case Verdict.Skipped:
      return "bx-sm text-blue-500";
    default:
      return "bx-xs text-gray-500 mr-2";
  }
}
