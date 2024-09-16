import classNames from "classnames";
import type { editor } from "monaco-editor"
import MonacoEditor from "@monaco-editor/react";
import { useCallback } from "react";
import { Scrollable } from "client/components/scrollable";
import { LatexDisplay } from "client/components/latex_display";
import styles from "./common_editor.module.css";

const MonacoOptions: editor.IStandaloneEditorConstructionOptions = {
  language: 'latex',
  wordWrap: 'on',
  minimap: {
    enabled: false,
  },
};

type CommonEditorStatementProps = {
  statement: string;
  setStatement(statement: string): void;
};

export const CommonEditorStatement = ({ statement, setStatement }: CommonEditorStatementProps) => {
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
        </div>
      </Scrollable>
    </>
  );
};
