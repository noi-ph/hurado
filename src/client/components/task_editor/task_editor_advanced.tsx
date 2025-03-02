import classNames from "classnames";
import { useCallback } from "react";
import styles from "client/components/common_editor/common_editor.module.css";
import { InputChangeEvent, SelectChangeEvent } from "common/types/events";
import { CommonEditorContent, CommonEditorDetails, CommonEditorLabel, CommonEditorSelect } from "../common_editor";
import { Scrollable } from "../scrollable";
import { TaskED } from "./types";

type TaskEditorAdvancedProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorAdvanced = ({ task, setTask }: TaskEditorAdvancedProps) => {
  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Is Public?" />
        <TaskEditorPublic task={task} setTask={setTask}/>
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type TaskEditorPublicProps = {
  task: TaskED;
  setTask(task: TaskED): void;
}
export const TaskEditorPublic = ({ task, setTask }: TaskEditorPublicProps) => {
  const onChangePublic = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        is_public: event.target.checked,
      });
    },
    [task, setTask]
  );
  return (
    <>
      <input
        type='checkbox'
        className="border-2 border-gray-250 rounded-md h-6 w-6 self-center"
        checked={task.is_public}
        onChange={onChangePublic}
      />
    </>
  );
}