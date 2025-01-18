"use client";

import classNames from "classnames";
import type { editor } from "monaco-editor";
import MonacoEditor from "@monaco-editor/react";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useState } from "react";
import { SubmissionsCacheContext } from "client/submissions";
import { humanizeLanguage, Language } from "common/types/constants";
import { SelectChangeEvent } from "common/types/events";
import styles from "./submit_panel.module.css";
import "./submit_panel.css"; // This is not a mistake
import { createSubmissionCode, postSubmission } from "./submit_utils";


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

  const submissions = useContext(SubmissionsCacheContext);
  const router = useRouter();

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
    const data = createSubmissionCode(taskId, language, code);
    postSubmission(data, submissions, router);
    setSubmitting(false);
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
