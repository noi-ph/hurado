import React from "react";

import { FileUploadArea } from "./File";

type ScriptUploadAreaProps = {
  forName: {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
  };
  forFile: {
    file: null;
    setFile: React.Dispatch<React.SetStateAction<null>>;
  };
  forLanguageCode: {
    languageCode: string;
    setLanguageCode: React.Dispatch<React.SetStateAction<string>>;
  };
  forRuntimeArgs: {
    runtimeArgs: string;
    setRuntimeArgs: React.Dispatch<React.SetStateAction<string>>;
  };
};

const ScriptUploadArea = (props: ScriptUploadAreaProps) => {
  const { languageCode, setLanguageCode } = props.forLanguageCode;
  const { runtimeArgs, setRuntimeArgs } = props.forRuntimeArgs;

  return (
    <>
      <FileUploadArea forName={props.forName} forFile={props.forFile} />

      <label>
        Language code:
        <input
          type="text"
          value={languageCode}
          onChange={(event) => setLanguageCode(event.target.value)}
        />
      </label>

      <br />

      <label>
        Runtime arguments:
        <input
          type="text"
          value={runtimeArgs}
          onChange={(event) => setRuntimeArgs(event.target.value)}
        />
      </label>
    </>
  );
};

export { ScriptUploadArea };
