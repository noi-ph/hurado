import { useCallback } from "react";
import { Arrays } from "common/utils/arrays";
import { InputChangeEvent, SelectChangeEvent } from "common/types/events";
import {
  CommonEditorAddButton,
  CommonEditorLabel,
  CommonEditorSelect,
  CommonEditorInput,
  CommonEditorActionButton,
  CommonEditorFileInput,
  CommonFileED,
  EditorKind,
} from "client/components/common_editor";
import { TaskScriptED } from "../task_editor/types";
import { Language } from "common/types/constants";


type TaskEditorScriptProps = {
  script: TaskScriptED;
  setScript(script: TaskScriptED): void;
};

export const TaskEditorScript = ({ script, setScript }: TaskEditorScriptProps): React.ReactElement => {
  const onLanguageChange = useCallback((event: SelectChangeEvent) => {
    const language = event.target.value as Language;
    setScript({
      ...script,
      language,
    });
  }, [script, setScript]);

  const onArgumentAdd = useCallback(() => {
    setScript({
      ...script,
      argv: [...script.argv, ""],
    });
  }, [script, setScript]);

  const onFileChange = useCallback((file: CommonFileED | null, filename: string) => {
    setScript({
      ...script,
      kind: EditorKind.Local,
      file: file,
      file_name: filename,
    });
  }, [script, setScript]);

  const onFilenameChange = useCallback((filename: string) => {
    setScript({
      ...script,
      file_name: filename,
    });
  }, [script, setScript]);

  return (
    <>
      <CommonEditorLabel label="Language" />
      <CommonEditorSelect value={script.language} onChange={onLanguageChange}>
        <option value={Language.Python3}>Python 3</option>
        <option value={Language.Java}>Java</option>
        <option value={Language.CPP}>C++</option>
      </CommonEditorSelect>
      <CommonEditorLabel label="Source Code" />
      <CommonEditorFileInput
        style="detail"
        file={script.file}
        filename={script.file_name}
        onFileChange={onFileChange}
        onFilenameChange={onFilenameChange}
        disabled={false}
      />
      <CommonEditorLabel label="Arguments" />
      <div className="flex flex-col gap-2">
        {script.argv.map((arg, index) => (
          <TaskEditorScriptArgument
            key={index}
            index={index}
            script={script}
            setScript={setScript}
          />
        ))}
        <div>
          <CommonEditorAddButton
            onClick={onArgumentAdd}
            label="Add Argument"
          />
        </div>
      </div>
    </>
  );
};


type TaskEditorScriptArgumentProps = {
  index: number;
  script: TaskScriptED;
  setScript(script: TaskScriptED): void;
};

export const TaskEditorScriptArgument = ({ index, script, setScript }: TaskEditorScriptArgumentProps): React.ReactElement => {
  const onArgumentChange = useCallback((event: InputChangeEvent) => {
    setScript({
      ...script,
      argv: Arrays.replaceNth(script.argv, index, event.target.value),
    });
  }, [script, setScript]);

  const onArgumentRemove = useCallback(() => {
    setScript({
      ...script,
      argv: Arrays.removeNth(script.argv, index),
    });
  }, [script, setScript]);

  return (
    <div className="flex">
      <CommonEditorInput
        type="text"
        value={script.argv[index]}
        onChange={onArgumentChange}
        className="flex-auto"
      />
      <CommonEditorActionButton size="bx-sm" icon="bx-x" onClick={onArgumentRemove} />
    </div>
  );
};