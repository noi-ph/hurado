import classNames from "classnames";
import { useCallback } from "react";
import { Scrollable } from "client/components/scrollable";
import { CommonEditorLabel, CommonEditorSelect } from "client/components/common_editor";
import styles from "client/components/common_editor/common_editor.module.css";
import { SelectChangeEvent } from "common/types/events";
import { TaskFlavor, TaskType } from "common/types/constants";
import { TaskEditorSubtasks } from "./task_editor_subtasks";
import { TaskED } from "./types";

type TaskEditorJudgingProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorJudging = ({ task, setTask }: TaskEditorJudgingProps) => {
  return (
    <Scrollable className={classNames(styles.content, "p-4")}>
      <TaskTypeEditor task={task} setTask={setTask} />
      <TaskEditorSubtasks task={task} setTask={setTask} />
    </Scrollable>
  );
};

const TaskTypeEditor = ({ task, setTask }: TaskEditorJudgingProps) => {
  const onChangeTaskType = useCallback(
    (event: SelectChangeEvent) => {
      const type = coerceTaskType(event.target.value);
      if (type === TaskType.OutputOnly) {
        setTask({
          ...task,
          type: type,
          flavor: TaskFlavor.OutputText,
        });
      } else {
        setTask({
          ...task,
          type: type,
          flavor: null,
        });
      }
    },
    [task]
  );

  const onChangeTaskFlavor = useCallback(
    (event: SelectChangeEvent) => {
      const flavor = coerceTaskFlavor(event.target.value);
      setTask({
        ...task,
        flavor: flavor,
      });
    },
    [task]
  );

  return (
    <div className="grid grid-cols-2 items-center p-4 gap-x-8 gap-y-4">
      <div className="flex gap-8 items-center">
        <CommonEditorLabel label="Task Type" />
        <CommonEditorSelect className="flex-auto" value={task.type} onChange={onChangeTaskType}>
          <option value={TaskType.Batch}>Batch</option>
          <option value={TaskType.Communication}>Communication</option>
          <option value={TaskType.OutputOnly}>Output Only</option>
        </CommonEditorSelect>
      </div>
      {task.type === TaskType.OutputOnly && (
        <div className="flex gap-8 items-center">
          <CommonEditorLabel label="Task Flavor" />
          <CommonEditorSelect
            className="flex-auto"
            value={task.flavor ?? TaskFlavor.OutputText}
            onChange={onChangeTaskFlavor}
          >
            <option value={TaskFlavor.OutputText}>Text Input</option>
            <option value={TaskFlavor.OutputFile}>File Upload</option>
          </CommonEditorSelect>
        </div>
      )}
    </div>
  );
};

function coerceTaskType(type: string): TaskType {
  switch (type) {
    case TaskType.Batch:
    case TaskType.Communication:
    case TaskType.OutputOnly:
      return type;
    default:
      return TaskType.Batch;
  }
}

function coerceTaskFlavor(flavor: string): TaskFlavor {
  switch (flavor) {
    case TaskFlavor.OutputText:
    case TaskFlavor.OutputFile:
      return flavor;
    default:
      return TaskFlavor.OutputText;
  }
}
