import classNames from "classnames";
import { useCallback } from "react";
import { Scrollable } from "../scrollable";
import { EditorKind, TaskED } from "./types";
import {
  TaskEditorAddButton,
  TaskEditorLabel,
  TaskEditorSelect,
  useTaskStringPropUpdater,
} from "./task_editor_utils";
import { SelectChangeEvent } from "common/types/events";
import { TaskType } from "common/types/constants";
import styles from "./task_editor.module.css";
import { TaskEditorSubtasks } from "./task_editor_subtasks";

type TaskEditorJudgingProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorJudging = ({ task, setTask }: TaskEditorJudgingProps) => {
  const onChangeTaskType = useCallback(
    (event: SelectChangeEvent) => {
      setTask({
        ...task,
        type: event.target.value as TaskType,
      });
    },
    [task]
  );

  return (
    <Scrollable className={classNames(styles.content, "p-4")}>
      <TaskEditorSelect value={task.type} onChange={onChangeTaskType}>
        <option value={TaskType.Batch}>Batch</option>
        <option value={TaskType.Communication}>Communication</option>
        <option value={TaskType.OutputOnly}>Output Only</option>
      </TaskEditorSelect>
      <TaskCheckerEditor task={task} setTask={setTask} />
      <TaskEditorSubtasks task={task} setTask={setTask} />
    </Scrollable>
  );
};

type TaskCheckerEditorProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskCheckerEditor = ({ task, setTask }: TaskCheckerEditorProps) => {
  const onChangeChecker = useTaskStringPropUpdater(task, setTask, "checker");

  return (
    <div className={classNames(styles.detailEditor, "p-4 gap-12")}>
      <TaskEditorLabel label="Checker" />
    </div>
  );
};
