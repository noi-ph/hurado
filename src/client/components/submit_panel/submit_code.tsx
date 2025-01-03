"use client";

import classNames from "classnames";
import { useCallback, useContext, useEffect, useState } from "react";
import type { editor } from "monaco-editor";
import MonacoEditor from "@monaco-editor/react";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import { humanizeLanguage, Language } from "common/types/constants";
import { SelectChangeEvent } from "common/types/events";
import styles from "./submit_panel.module.css";
import "./submit_panel.css"; // This is not a mistake
import { useRouter } from "next/navigation";
import { TaskViewerTab, coerceTaskViewerTab } from "../task_viewer/task_viewer_tabs";
import { getLocationHash } from "../common_editor";
import { RefreshSubmissionsContext } from "../task_viewer/task_viewer";


const MonacoOptions: editor.IStandaloneEditorConstructionOptions = {
  language: Language.Python3,
  minimap: {
    enabled: false,
  },
};

type SubmitCodeProps = {
  taskId: string;
};

export const SubmitCode = ({ taskId }: SubmitCodeProps) => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>(Language.Python3);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const {refresh, setRefresh} = useContext(RefreshSubmissionsContext);

  const onChangeCode = useCallback((value: string | undefined) => {
    setCode(value ?? "");
  }, []);

  const onChangeLanguage = useCallback((event: SelectChangeEvent) => {
    setLanguage(event.target.value as Language);
  }, []);

  const submit = useCallback(async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      const request: SubmissionRequestDTO = {
        task_id: taskId,
        language: language,
      };
      const blobRequest = new Blob([JSON.stringify(request)], { type: "application/json" });
      data.set("request", blobRequest);

      const blobSource = new Blob([code], { type: "text/plain" });
      data.set("source", blobSource);

      const submissionCreateURL = getAPIPath({ kind: APIPath.SubmissionCreate });
      const response = await http.post(submissionCreateURL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status == 200) {
        setRefresh(true);
        router.push(`#${TaskViewerTab.Submissions}`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [taskId, submitting, language, code]);

  // .submit-panel is a non-module class used to style the monaco editor's line numbers
  return (
    <div className="submit-panel border border-gray-300">
      <div className="flex py-2 pl-4 pr-6 border-b border-gray-300">
        <select className={styles.language} value={language} onChange={onChangeLanguage}>
          <option value={Language.Python3}>{humanizeLanguage(Language.Python3)}</option>
          <option value={Language.CPP}>{humanizeLanguage(Language.CPP)}</option>
          <option value={Language.Java}>{humanizeLanguage(Language.Java)}</option>
        </select>
      </div>
      <div className={classNames(styles.editor, "border-b border-gray-300")}>
        <MonacoEditor
          defaultValue={code}
          onChange={onChangeCode}
          options={MonacoOptions}
          language={language}
          theme="light"
        />
      </div>
      <div className="flex py-2 pl-4 pr-6">
        <button type="submit" className={styles.button} onClick={submit} disabled={submitting}>
          Submit
        </button>
      </div>
    </div>
  );
};
