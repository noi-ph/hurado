"use client";

import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useState } from "react";
import { SubmissionSummaryDTO, TaskViewerOutputDTO } from "common/types";
import { Language, TaskFlavor, TaskFlavorOutput } from "common/types/constants";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import http from "client/http";
import { APIPath, Path, getAPIPath, getPath } from "client/paths";
import { SubmissionsCacheContext } from "client/submissions";
import styles from "./submit_panel.module.css";
import { UnreachableError } from "common/errors";
import { InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";


type SubtaskState = {
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
    try {
      const data = new FormData();
      const request: SubmissionRequestDTO = {
        task_id: task.id,
        language: Language.PlainText,
      };

      const blobRequest = new Blob([JSON.stringify(request)], { type: "application/json" });
      data.set("request", blobRequest);

      for (let i = 0; i < task.subtasks.length; i++) {
        // Task-provided file names are prepended with $ to not collide with internal stuff
        const filename = "$" + task.subtasks[i].file_name;

        let blob: Blob | null = null;
        if (task.flavor === TaskFlavor.OutputText) {
          const text = subtasks[i].text;
          if (text.trim() != "") {
            blob = new Blob([text]);
          }
        } else if (task.flavor === TaskFlavor.OutputFile) {
          blob = subtasks[i].file;
        } else {
          throw new UnreachableError(task.flavor);
        }

        if (blob != null) {
          data.set(filename, blob);
        }
      }

      const submissionCreateURL = getAPIPath({ kind: APIPath.SubmissionCreate });
      const response: AxiosResponse<SubmissionSummaryDTO> = await http.post(submissionCreateURL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status == 200) {
        const submission = response.data;
        if (submissions) {
          submissions.clear();
        }
        router.refresh();
        router.push(getPath({ kind: Path.Submission, uuid: submission.id }));
      }
    } finally {
      setSubmitting(false);
    }
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
