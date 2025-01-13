import classNames from "classnames";
import type { editor } from "monaco-editor"
import MonacoEditor from "@monaco-editor/react";
import { useCallback } from "react";
import { Scrollable } from "client/components/scrollable";
import { LatexDisplay } from "client/components/latex_display";
import styles from "./common_editor.module.css";
import { TaskED } from "../task_editor/types";
import { SampleIODisplay } from "../sample_io_display/sample_io_display";

const MonacoOptions: editor.IStandaloneEditorConstructionOptions = {
  language: 'latex',
  wordWrap: 'on',
  minimap: {
    enabled: false,
  },
};

type CommonEditorStatementProps = {
  task: TaskED;
  statement: string;
  setStatement(statement: string): void;
};

export const CommonEditorStatement = ({ task, statement, setStatement }: CommonEditorStatementProps) => {
  const onChangeStatement = useCallback(
    (value: string | undefined) => {
      setStatement(value ?? "");
    },
    [statement, setStatement]
  );

  return (
    <>
      <div className={classNames(styles.statementEditor, 'pt-3 bg-gray-200')}>
        <MonacoEditor
          defaultValue={statement}
          onChange={onChangeStatement}
          options={MonacoOptions}
          theme="light"
        />
      </div>
      <Scrollable className={styles.statementPreview} defer>
        <div className='p-3 bg-white flex-auto min-h-full'>
          <LatexDisplay>{statement}</LatexDisplay>
          {task.sample_IO.map((sample, idx) => (
            <SampleIODisplay
              key={idx}
              sampleIndex={idx}
              input={sample.input}
              output={sample.output}
              explanation={sample.explanation}
            />
          ))}
        </div>
      </Scrollable>
    </>
  );
};
