import { useCallback } from "react";
import { CommonEditorAddButton, CommonEditorInput, EditorKind } from "../common_editor";
import { TaskED, TaskSampleIO_ED } from "./types";
import { InputChangeEvent } from "common/types/events";
import BoxIcon from "../box_icon";

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
          explanation: "",
        },
      ],
    });
  }, [task]);

  return (
    <div className="flex flex-col items-center gap-4">
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
        <CommonEditorAddButton label="Add Sample I/O" onClick={onSampleAdd} />
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
  const updateField = (field: 'input' | 'output' | 'explanation') => useCallback(
    (event: InputChangeEvent) => {
      const samples = [...task.sample_IO];
      samples[sampleIndex] = {...samples[sampleIndex]};
      samples[sampleIndex][field] = event.target.value;
      setTask({
        ...task,
        sample_IO: samples,
      });
    },
    [task, setTask],
  );

  const deleteSelf = useCallback(
    () => {
      const samples = [...task.sample_IO];
      samples.splice(sampleIndex, 1);
      setTask({
        ...task,
        sample_IO: samples,
      });
    },
    [task, setTask],
  );

  return (
    <>
      <div className="relative flex flex-row justify-between gap-4 w-full">
        <div className="text-lg text-gray-500 ml-auto mr-auto">
          {`Sample ${sampleIndex+1}`}
        </div>
        <button type="button" className="absolute right-0" onClick={deleteSelf}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
      <div className="flex flex-row justify-center gap-4 w-full">
        <CommonEditorInput
          type="textarea"
          value={sample.input}
          onChange={updateField('input')}
          placeholder="Sample Input"
          className="flex-auto"
        />
        <CommonEditorInput
          type="textarea"
          value={sample.output}
          onChange={updateField('output')}
          placeholder="Sample Output"
          className="flex-auto"
        />
      </div>
      <CommonEditorInput
        type="textarea"
        value={sample.explanation}
        onChange={updateField('explanation')}
        placeholder="Explanation"
        className="flex-auto w-full"
      />
    </>
  );
}