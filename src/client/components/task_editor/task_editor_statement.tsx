import MonacoEditor from "@monaco-editor/react";
import { MathJax } from "better-react-mathjax";
import classNames from "classnames";
import { useCallback } from "react";
import { TaskEditorTask } from "common/types";
import { Scrollable } from "client/components/scrollable";
import styles from "./task_editor.module.css";

const MonacoOptions = {
  defaultLanguage: 'latex',
  minimap: {
    enabled: false,
  },
};

type TaskEditorStatementProps = {
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
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
      <Scrollable className={styles.statementPreview} defer>
        <div className='p-3 bg-white flex-auto min-h-full'>
          <MathJax>{task.statement}</MathJax>
        </div>
      </Scrollable>
    </>
  );
};
