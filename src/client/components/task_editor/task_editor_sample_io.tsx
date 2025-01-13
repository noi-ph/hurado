import { useCallback } from "react";
import { CommonEditorAddButton, EditorKind } from "../common_editor";
import { TaskED, TaskSampleIO_ED } from "./types";

type TaskEditorSampleProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorSampleIO = ({ task, setTask }: TaskEditorSampleProps) => {
  const onSampleAdd = useCallback(() => {
    setTask({
      ...task,
      sample_IO: [
        ...task.sample_IO,
        {
          kind: EditorKind.Local,
          input: "",
          output: "",
        },
      ],
    });
  }, [task]);

  return (
    <div>
      {task.sample_IO.map((sample, idx) => (
        <TaskSampleIOEditor
          key={idx}
          sample={sample}
          sampleIndex={idx}
          task={task}
          setTask={setTask}
        />
      ))}
      <div className="text-center">
        <CommonEditorAddButton label="Add Subtask" onClick={onSampleAdd} />
      </div>
    </div>
  );
};

type TaskSampleIOEditorProps = {
  sample: TaskSampleIO_ED;
  sampleIndex: number;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskSampleIOEditor = ({ sample, sampleIndex, task, setTask }: TaskSampleIOEditorProps) => {
  return (
    <div>
      <input value={sample.input}>
      </input>
      <input value={sample.output}>
      </input>
    </div>
  );
}