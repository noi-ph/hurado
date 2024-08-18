"use client";

import React, { useCallback, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import { Language } from "common/types/constants";

const MonacoOptions = {
  defaultLanguage: Language.Python3,
  minimap: {
    enabled: false,
  },
};

type SubmitComponentProps = {
  taskId: string;
};

export const SubmitComponent = ({ taskId }: SubmitComponentProps) => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>(Language.Python3);
  const onChangeStatement = useCallback((value: string | undefined) => {
    setCode(value ?? "");
  }, []);

  const submit = React.useCallback(async () => {
    const data = new FormData();
    const request: SubmissionRequestDTO = {
      task_id: taskId,
      language: language,
    };
    const blobRequest = new Blob([JSON.stringify(request)], { type: "application/json" })
    data.set("request", blobRequest);

    const blobSource = new Blob([code], { type: "text/plain" });
    data.set("source", blobSource);

    const submissionCreateURL = getAPIPath({ kind: APIPath.SubmissionCreate });
    await http.post(submissionCreateURL, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }, [taskId, language, code]);

  return (
    <div>
      <div className="h-[80vh]">
        <MonacoEditor
          defaultValue={code}
          onChange={onChangeStatement}
          options={MonacoOptions}
          language={language}
          theme="light"
        />
      </div>
      <button type="submit" onClick={submit}>
        Submit
      </button>
    </div>
  );
};
