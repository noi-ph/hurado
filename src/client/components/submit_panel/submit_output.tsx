"use client";

import { useRouter } from "next/navigation";
import { useCallback, useContext, useState } from "react";
import { TaskViewerOutputDTO } from "common/types";
import { TaskFlavor, TaskFlavorOutput } from "common/types/constants";
import { SubmissionsCacheContext } from "client/submissions";
import { InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";
import styles from "./submit_panel.module.css";
import { createSubmissionOutput, postSubmission } from "./submit_utils";

export type SubtaskState = {
  text: string;
  file: File | null;
};

type SubmitOutputProps = {
  task: TaskViewerOutputDTO;
};

export function SubmitOutput({ task }: SubmitOutputProps) {
  const submissions = useContext(SubmissionsCacheContext);
  const router = useRouter();

  const [subtasks, setSubtasks] = useState<SubtaskState[]>(
    task.subtasks.map(() => ({
      file: null,
      text: "",
    }))
  );

  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    const data = createSubmissionOutput(task, subtasks);
    await postSubmission(data, submissions, router);
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [task, subtasks, submitting]);

  return (
    <div className="border border-gray-300 p-4 pb-3 pr-6">
      <div className={styles.outputGrid}>
        {subtasks.map((sub, idx) => (
          <SubmitOutputSubtask
            key={idx}
            flavor={task.flavor}
            subtask={sub}
            subtaskIndex={idx}
            subtasks={subtasks}
            setSubtasks={setSubtasks}
          />
        ))}
      </div>
      <div className="flex">
        <button type="submit" className={styles.button} onClick={submit} disabled={submitting}>
          Submit
        </button>
      </div>
    </div>
  );
}

type SubmitOutputSubtaskProps = {
  flavor: TaskFlavorOutput;
  subtask: SubtaskState;
  subtaskIndex: number;
  subtasks: SubtaskState[];
  setSubtasks(subtasks: SubtaskState[]): void;
};

function SubmitOutputSubtask({
  flavor,
  subtask,
  subtaskIndex,
  subtasks,
  setSubtasks,
}: SubmitOutputSubtaskProps) {
  const onChangeFile = useCallback(
    (event: InputChangeEvent) => {
      if (event.target.files != null && event.target.files.length > 0) {
        const file = event.target.files[0];
        setSubtasks(
          Arrays.replaceNth(subtasks, subtaskIndex, {
            ...subtask,
            file,
          })
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [subtasks, subtaskIndex]
  );

  const onChangeText = useCallback(
    (event: InputChangeEvent) => {
      setSubtasks(
        Arrays.replaceNth(subtasks, subtaskIndex, {
          ...subtask,
          text: event.target.value,
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [subtasks, subtaskIndex]
  );

  let inputEl: React.ReactNode;
  if (flavor === TaskFlavor.OutputText) {
    inputEl = (
      <input
        type="text"
        value={subtask.text}
        onChange={onChangeText}
        className="font-mono border-b border-gray-300 py-1 px-2"
      />
    );
  } else {
    inputEl = (
      <input
        type="file"
        onChange={onChangeFile}
        className="font-mono border-b border-gray-300 py-1 px-2"
      />
    );
  }

  return (
    <>
      <div>Subtask #{subtaskIndex + 1}:</div>
      <div>{inputEl}</div>
    </>
  );
}
