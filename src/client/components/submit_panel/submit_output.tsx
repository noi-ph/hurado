"use client";

import classNames from "classnames";
import { useCallback, useState } from "react";
import { TaskViewerOutputDTO } from "common/types";
import { Language } from "common/types/constants";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import styles from "./submit_panel.module.css";

type SubmitOutputProps = {
  task: TaskViewerOutputDTO;
};

export const SubmitOutput = ({ task }: SubmitOutputProps) => {
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

      // const blobSource = new Blob([code], { type: "text/plain" });
      // data.set("source", blobSource);

      const submissionCreateURL = getAPIPath({ kind: APIPath.SubmissionCreate });
      await http.post(submissionCreateURL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } finally {
      setSubmitting(false);
    }
  }, [task, submitting]);

  return (
    <div className="submit-panel border border-gray-300">
      <div className="flex py-2 pl-4 pr-6 border-b border-gray-300">Flavor: {task.flavor}</div>
      {task.subtasks.map(s => s.name)}
      <div className="flex py-2 pl-4 pr-6">
        <button type="submit" className={styles.button} onClick={submit} disabled={submitting}>
          Submit
        </button>
      </div>
    </div>
  );
};
