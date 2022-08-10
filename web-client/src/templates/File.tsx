import React from 'react';

type FileUploadAreaProps = {
  forName: {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
  };
  forFile: {
    file: null;
    setFile: React.Dispatch<React.SetStateAction<null>>;
  };
};

const FileUploadArea = (props: FileUploadAreaProps) => {
  const { name, setName } = props.forName;
  const { file, setFile } = props.forFile;

  return (
    <>
      <label>
        File name:
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <br />

      <label>
        File:
        <input
          type="file"
          value={file}
          onChange={(event) => setFile(event.target.value)}
        />
      </label>

      <br />
    </>
  );
};

export { FileUploadArea };
