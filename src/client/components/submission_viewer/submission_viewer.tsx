"use client";

import classNames from "classnames";
import type { editor } from "monaco-editor";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { useCallback, useRef } from "react";
import Link from "next/link";
import {
  SubmissionViewerDTO,
  VerdictSubtaskViewerDTO,
  VerdictTaskDataViewerDTO,
} from "common/types";
import { humanizeLanguage, humanizeVerdict, Verdict } from "common/types/constants";
import { formatDateTime, humanizeTimeAgo } from "common/utils/dates";
import { notNull } from "common/utils/guards";
import { uuidToHuradoID } from "common/utils/uuid";
import BoxIcon from "client/components/box_icon";
import { getPath, Path } from "client/paths";
import { getVerdictColorClass } from "client/verdicts";

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

export const SubmissionViewer = ({ submission }: SubmissionViewerProps) => {
  const baseTaskURL = getPath({ kind: Path.TaskView, slug: submission.task.slug });
  const taskURL = `${baseTaskURL}#submissions`;

  return (
    <>
      <div className="flex items-end mt-2 mb-4">
        <Link
          href={taskURL}
          className="flex items-center font-sans font-bold text-4xl text-blue-400"
        >
          <BoxIcon name="bx-chevron-left" className="bx-lg" />
          {submission.task.title}
        </Link>
        <div className="ml-auto text-gray-300 whitespace-nowrap">
          {uuidToHuradoID(submission.id)}
        </div>
      </div>
      <SubmissionVerdictSummary submission={submission} />
      {submission.verdict != null ? (
        <>
          <div className="text-2xl mt-3 mb-2">Judgement Details</div>
          <SubmissionVerdictViewer submission={submission} />
        </>
      ) : null}
      <div className="text-2xl mt-3 mb-2">Submitted Code</div>
      <SubmissionCodeViewer submission={submission} />
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
        {humanizeVerdict(submission.verdict.verdict)}
      </span>
    );
  }

  let score: React.ReactNode = null;
  if (submission.verdict != null) {
    const max = submission.verdict.max_score;
    const raw = submission.verdict.raw_score;

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
  if (subtask.max_score != null && subtask.raw_score != null) {
    const max = subtask.max_score;
    const raw = subtask.raw_score;
    score = (
      <span className={classNames("font-medium", getScoreClassName(raw, max))}>
        {raw}/{max}
      </span>
    );
  } else {
    score = <span className="font-medium">N/A</span>;
  }

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-center px-4 py-2 rounded-t-lg bg-blue-300">
        <div className="text-lg">Subtask #{subtaskIndex + 1}</div>
        <div className="ml-auto">Score: {score}</div>
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

  const hVerdict = data.verdict != null ? humanizeVerdict(data.verdict) : "Pending";
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

  return (
    <div className="border border-gray-300">
      <div className="flex px-5 py-3 font-light box-border border-b border-gray-300">
        Language: {humanizeLanguage(submission.language)}
      </div>
      <div ref={containerRef}>
        <MonacoEditor
          value={submission.code}
          options={MonacoOptions}
          theme="light"
          onMount={onEditorMount}
        />
      </div>
    </div>
  );
};

function getScoreClassName(raw: number, max: number): string | undefined {
  if (raw == max) {
    return "text-green-500";
  } else if (raw > 0) {
    return "text-blue-500";
  } else {
    return undefined;
  }
}

function getVerdictIconClassName(verdict: Verdict | null): string | undefined {
  switch (verdict) {
    case Verdict.Accepted:
      return "bx-sm text-green-500";
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
