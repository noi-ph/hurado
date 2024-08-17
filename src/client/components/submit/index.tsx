"use client";

import React, { useCallback, useState } from "react";
import { FunctionComponent } from "react";
import MonacoEditor from "@monaco-editor/react";
import http from "client/http";

enum Languages {
  Python3 = "python3",
  Javascript = "javascript"
}

const MonacoOptions = {
  defaultLanguage: Languages.Javascript,
  minimap: {
    enabled: false,
  },
};

export const SubmitComponent: FunctionComponent = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<Languages>(Languages.Javascript)
  const onChangeStatement = useCallback(
    (value: string | undefined) => {
      setCode(value ?? '');
    },
    []
  );

  const submit = React.useCallback(async () => {
    const response = await http.post("/api/v1/submissions", { task: 1 });
    console.log("Testing response", response.data);
  }, []);

  return (
    <div>
      <div className="h-[80vh]">
        <MonacoEditor
          defaultValue={code}
          onChange={onChangeStatement}
          options={MonacoOptions}
          theme="vs-dark"
          language={language}
        />
      </div>
      <button type="submit" onClick={submit}>
        Submit
      </button>
    </div>
  );
};
