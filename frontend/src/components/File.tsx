import React from 'react'

type FileUploadAreaProps = {
  forName: {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
  };
  forFile: {
    file: null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
  };
};

const FileUploadArea = (props: FileUploadAreaProps) => {
  const { name, setName } = props.forName;
  const { setFile } = props.forFile;

  return (
    <React.Fragment>
      <label>
        File name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <br />

      <label>
        File:
        <input type="file" onChange={(e) => {if (e.target.files) setFile(e.target.files[0])}} />
      </label>
    </React.Fragment>
  );
};

export { FileUploadArea };