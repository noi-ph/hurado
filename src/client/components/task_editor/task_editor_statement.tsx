import { useCallback } from "react";
import { Task } from "common/types";
import { TextAreaChangeEvent } from "common/types/events";

type TaskEditorStatementProps = {
  task: Task;
  setTask(task: Task): void;
};

export const TaskEditorStatement = ({ task, setTask }: TaskEditorStatementProps) => {
  const onChangeStatement = useCallback(
    (event: TextAreaChangeEvent) => {
      setTask({
        ...task,
        statement: event.target.value,
      });
    },
    [task, setTask]
  );

  return (
    <div className="flex flex-row justify-between">
      <textarea value={task.statement} onChange={onChangeStatement} />
      <div>{task.statement}</div>
    </div>
  );
};
