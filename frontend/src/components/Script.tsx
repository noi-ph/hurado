import React from 'react';

import { FileUploadArea } from './File';

type ScriptUploadAreaProps = {
  Context: React.Context<any>;
};

const ScriptUploadArea = (props: ScriptUploadAreaProps) => {
  const {
    name,
    setName,
    file,
    setFile,
    languageCode,
    setLanguageCode,
    runtimeArgs,
    setRuntimeArgs
  } = React.useContext(props.Context);

  return (
    <React.Fragment>
      <FileUploadArea forName={{ name, setName }} forFile={{ file, setFile }} />
      <br />

      <label>
        Language code:
        <input type="text" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} />
      </label>
      <br />

      <label>
        Runtime arguments:
        <input type="text" value={runtimeArgs} onChange={(e) => setRuntimeArgs(e.target.value)} />
      </label>
    </React.Fragment>
  );
};

export { ScriptUploadArea };