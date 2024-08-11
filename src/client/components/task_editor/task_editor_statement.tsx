import { useCallback } from "react";
import { MathJax } from "better-react-mathjax";
import { Task } from "common/types";
import { editor } from "monaco-editor";
import MonacoEditor from "@monaco-editor/react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import styles from "./task_editor.module.css";
import classNames from "classnames";

const MonacoOptions: editor.IStandaloneEditorConstructionOptions = {
  minimap: {
    enabled: false,
  },
};

type TaskEditorStatementProps = {
  task: Task;
  setTask(task: Task): void;
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
          theme="vs-dark"
        />
      </div>
      <OverlayScrollbarsComponent className={styles.statementPreview} defer>
        <div className='p-3 bg-white flex-auto min-h-full'>
          <MathJax inline={true}>{task.statement}</MathJax>
        </div>
      </OverlayScrollbarsComponent>
    </>
  );
};
