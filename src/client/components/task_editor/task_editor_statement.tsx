import classNames from "classnames";
import type { editor } from "monaco-editor"
import MonacoEditor from "@monaco-editor/react";
import { useCallback } from "react";
import { Scrollable } from "client/components/scrollable";
import { LatexDisplay } from "client/components/latex_display";
import styles from "./task_editor.module.css";
import { TaskED } from "./types";

const MonacoOptions: editor.IStandaloneEditorConstructionOptions = {
  language: 'latex',
  wordWrap: 'on',
  minimap: {
    enabled: false,
  },
};

type TaskEditorStatementProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorStatement = ({ task, setTask }: TaskEditorStatementProps) => {
  const onChangeStatement = useCallback(
    (value: string | undefined) => {
      setTask({
        ...task,
        statement: value ?? "",
      });
    },
    [task, setTask]
  );

  return (
    <>
      <div className={classNames(styles.statementEditor, 'pt-3 bg-gray-200')}>
        <MonacoEditor
          defaultValue={task.statement}
          onChange={onChangeStatement}
          options={MonacoOptions}
          theme="light"
        />
      </div>
      <Scrollable className={styles.statementPreview} defer>
        <div className='p-3 bg-white flex-auto min-h-full'>
          <LatexDisplay>{task.statement}</LatexDisplay>
        </div>
      </Scrollable>
    </>
  );
};
