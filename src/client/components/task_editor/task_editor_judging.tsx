import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import styles from "./task_editor.module.css";
import { Scrollable } from "../scrollable";
import {
  EditorKind,
  TaskED,
  TaskFileED,
  TaskFileLocal,
  TaskSubtaskED,
  TaskDataED,
  TaskDataLocal,
} from "./types";
import {
  destructivelyComputeSHA1,
  TaskEditorActionButton,
  TaskEditorActionLink,
  TaskEditorAddButton,
  TaskEditorInput,
  TaskEditorInputSubtle,
  TaskEditorLabel,
  TaskEditorTableCell,
  useTaskStringPropUpdater,
} from "./task_editor_utils";
import { InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";

type TaskEditorJudgingProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorJudging = ({ task, setTask }: TaskEditorJudgingProps) => {
  const onChangeChecker = useTaskStringPropUpdater(task, setTask, "checker");
  const onAddSubtask = useCallback(() => {
    setTask({
      ...task,
      subtasks: [
        ...task.subtasks,
        {
          kind: EditorKind.Local,
          name: "New Subtask",
          score_max: 0,
          data: [],
          deleted: false,
        },
      ],
    });
  }, [task]);

  return (
    <Scrollable className={styles.content}>
      <div className={classNames(styles.detailEditor, "p-4 gap-12")}>
        <TaskEditorLabel label="Checker" />
        <TaskEditorInput type="text" value={task.checker} onChange={onChangeChecker} />
      </div>
      <div className="p-4">
        <div className="text-lg text-gray-500 mb-4">Subtasks</div>

        {task.subtasks.map((subtask, idx) => (
          <TaskSubtaskEditor
            key={idx}
            subtask={subtask}
            subtaskIndex={idx}
            task={task}
            setTask={setTask}
          />
        ))}

        <div className="text-center">
          <TaskEditorAddButton label="Add Subtask" onClick={onAddSubtask} />
        </div>
      </div>
    </Scrollable>
  );
};

type TaskSubtaskEditorProps = {
  subtask: TaskSubtaskED;
  subtaskIndex: number;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskSubtaskEditor = ({ subtask, subtaskIndex, task, setTask }: TaskSubtaskEditorProps) => {
  const [textScoreMax, setTextScoreMax] = useState<string>(subtask.score_max.toString());

  const replaceThisSubtask = useCallback(
    (newSubtask: TaskSubtaskED) => {
      setTask({
        ...task,
        subtasks: Arrays.replaceNth(task.subtasks, subtaskIndex, newSubtask),
      });
    },
    [task, subtaskIndex]
  );

  const onSubtaskNameChange = useCallback(
    (event: InputChangeEvent) => {
      replaceThisSubtask({
        ...subtask,
        name: event.target.value,
      });
    },
    [subtask, replaceThisSubtask]
  );

  const onSubtaskScoreMaxChange = useCallback(
    (event: InputChangeEvent) => {
      setTextScoreMax(event.target.value);
      replaceThisSubtask({
        ...subtask,
        score_max: +event.target.value,
      });
    },
    [subtask, replaceThisSubtask]
  );

  const onAddTaskData = useCallback(() => {
    const newTaskData: TaskDataLocal = {
      kind: EditorKind.Local,
      name: "Data",
      input_file_name: "",
      input_file: null,
      output_file_name: "",
      output_file: null,
      judge_file_name: null,
      judge_file: null,
      is_sample: false,
    };
    replaceThisSubtask({
      ...subtask,
      data: [...subtask.data, newTaskData],
    });
  }, [subtask, replaceThisSubtask]);

  return (
    <div className="mb-4">
      <div className="flex flex-row mb-2">
        <TaskEditorInputSubtle
          value={subtask.name}
          onChange={onSubtaskNameChange}
          placeholder="Subtask Name"
          className="flex-auto mr-2"
        />
        <span className="text-gray-500 mr-2">Score Max:</span>
        <TaskEditorInputSubtle
          value={textScoreMax}
          onChange={onSubtaskScoreMaxChange}
          className="font-bold max-w-[100px]"
        />
      </div>
      <div className={classNames(styles.testData, "border border-gray-300 rounded-lg text-center")}>
        <div className="text-gray-500 font-roboto font-medium">Name</div>
        <div className="text-gray-500 font-roboto font-medium">Input</div>
        <div className="text-gray-500 font-roboto font-medium">Output</div>
        <div className="text-gray-500 font-roboto font-medium">Judge</div>
        <div className="text-gray-500 font-roboto font-medium">Actions</div>
        {subtask.data.map((data, dataIndex) => (
          <TaskDataEditor
            key={dataIndex}
            data={data}
            dataIndex={dataIndex}
            subtask={subtask}
            subtaskIndex={subtaskIndex}
            task={task}
            setTask={setTask}
          />
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <TaskEditorAddButton onClick={onAddTaskData} label="Add Test Data" />
      </div>
    </div>
  );
};

type TaskDataEditorProps = {
  data: TaskDataED;
  dataIndex: number;
  subtask: TaskSubtaskED;
  subtaskIndex: number;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskDataEditor = (props: TaskDataEditorProps) => {
  const { data, dataIndex, subtask, subtaskIndex, task, setTask } = props;

  // Simple utility to replace the test data object with a new one
  const replaceThisTaskData = useCallback(
    (newData: TaskDataED) => {
      setTask({
        ...task,
        subtasks: Arrays.replaceNth(task.subtasks, subtaskIndex, {
          ...subtask,
          data: Arrays.replaceNth(subtask.data, dataIndex, newData),
        }),
      });
    },
    [task, subtask, subtaskIndex, dataIndex]
  );

  const onTaskDataNameChange = useCallback(
    (event: InputChangeEvent) => {
      replaceThisTaskData({
        ...data,
        name: event.target.value,
      });
    },
    [data, replaceThisTaskData]
  );

  const onInputFilenameChange = useCallback(
    (filename: string) => {
      replaceThisTaskData({
        ...data,
        input_file_name: filename,
      });
    },
    [data, replaceThisTaskData]
  );

  const onOutputFilenameChange = useCallback(
    (filename: string) => {
      replaceThisTaskData({
        ...data,
        output_file_name: filename,
      });
    },
    [data, replaceThisTaskData]
  );

  const onJudgeFilenameChange = useCallback(
    (filename: string) => {
      replaceThisTaskData({
        ...data,
        judge_file_name: filename,
      });
    },
    [data, replaceThisTaskData]
  );

  const onInputFileChange = useCallback(
    (file: TaskFileED | null, filename: string) => {
      replaceThisTaskData({
        ...data,
        input_file_name: filename,
        input_file: file,
      });
    },
    [data, replaceThisTaskData]
  );

  const onOutputFileChange = useCallback(
    (file: TaskFileED | null, filename: string) => {
      replaceThisTaskData({
        ...data,
        output_file_name: filename,
        output_file: file,
      });
    },
    [data, replaceThisTaskData]
  );

  const onJudgeFileChange = useCallback(
    (file: TaskFileED | null, filename: string) => {
      replaceThisTaskData({
        ...data,
        judge_file_name: filename,
        judge_file: file,
      });
    },
    [data, replaceThisTaskData]
  );

  const onTaskDataMoveUp = useCallback(() => {
    setTask({
      ...task,
      subtasks: Arrays.replaceNth(task.subtasks, subtaskIndex, {
        ...subtask,
        data: Arrays.moveUp(subtask.data, dataIndex),
      }),
    });
  }, [data, replaceThisTaskData]);

  const onTaskDataMoveDown = useCallback(() => {
    setTask({
      ...task,
      subtasks: Arrays.replaceNth(task.subtasks, subtaskIndex, {
        ...subtask,
        data: Arrays.moveDown(subtask.data, dataIndex),
      }),
    });
  }, [data, replaceThisTaskData]);

  const onTaskDataRemove = useCallback(() => {
    replaceThisTaskData({
      ...data,
      deleted: !data.deleted,
    });
  }, [data, replaceThisTaskData]);

  return (
    <>
      <TaskEditorTableCell>
        <TaskEditorInputSubtle
          value={data.name}
          onChange={onTaskDataNameChange}
          placeholder={`Test #${dataIndex + 1}`}
          className="w-full"
          disabled={data.deleted}
        />
      </TaskEditorTableCell>
      <TaskEditorTableCell deleted={false}>
        <TaskDataFileEditor
          file={data.input_file}
          onFileChange={onInputFileChange}
          filename={data.input_file_name}
          onFilenameChange={onInputFilenameChange}
          disabled={data.deleted}
        />
      </TaskEditorTableCell>
      <TaskEditorTableCell>
        <TaskDataFileEditor
          file={data.output_file}
          onFileChange={onOutputFileChange}
          filename={data.output_file_name}
          onFilenameChange={onOutputFilenameChange}
          disabled={data.deleted}
        />
      </TaskEditorTableCell>
      <TaskEditorTableCell deleted={false}>
        <TaskDataFileEditor
          file={data.judge_file}
          onFileChange={onJudgeFileChange}
          filename={data.judge_file_name}
          onFilenameChange={onJudgeFilenameChange}
          disabled={data.deleted}
        />
      </TaskEditorTableCell>
      <TaskEditorTableCell>
        <TaskEditorActionButton size="bx-sm" icon="bx-chevron-up" onClick={onTaskDataMoveUp} />
        <TaskEditorActionButton size="bx-sm" icon="bx-chevron-down" onClick={onTaskDataMoveDown} />
        <TaskEditorActionButton size="bx-sm" icon="bx-x" onClick={onTaskDataRemove} />
      </TaskEditorTableCell>
    </>
  );
};

type TaskDataFileEditor = {
  file: TaskFileED | null;
  onFileChange(file: TaskFileED | null, filename: string): void;
  filename: string | null;
  onFilenameChange(filename: string): void;
  disabled: boolean;
};

const TaskDataFileEditor = (props: TaskDataFileEditor) => {
  const { filename, file, onFilenameChange, onFileChange, disabled } = props;
  const pickerRef = useRef<HTMLInputElement>(null);

  const onPickerClick = useCallback(() => {
    if (pickerRef.current != null) {
      pickerRef.current.click();
    }
  }, []);

  const onFileSelect = useCallback(() => {
    if (pickerRef.current?.files != null && pickerRef.current.files?.length > 0) {
      const curr = pickerRef.current.files[0];
      const newFile: TaskFileLocal = {
        kind: EditorKind.Local,
        file: curr,
        hash: "",
      };
      destructivelyComputeSHA1(newFile);
      onFileChange(newFile, curr.name);
    }
  }, [file, filename, onFileChange]);

  const onFileRemove = useCallback(() => {
    onFileChange(null, "");
  }, [file, filename, onFileChange]);

  const onNameChange = useCallback(
    (event: InputChangeEvent) => {
      onFilenameChange(event.target.value);
    },
    [onFilenameChange]
  );

  if (file == null) {
    return (
      <>
        <button
          type="button"
          onClick={onPickerClick}
          disabled={disabled}
          className={classNames(disabled ? "text-gray-300 hover:cursor-default" : "text-gray-500")}
        >
          Select file...
        </button>
        <input
          type="file"
          className="hidden"
          onChange={onFileSelect}
          ref={pickerRef}
        />
      </>
    );
  } else {
    return (
      <div className="flex flex-row gap-2">
        <TaskEditorInputSubtle
          className="flex-auto"
          value={filename ?? ""}
          onChange={onNameChange}
          disabled={disabled}
        />
        {!disabled && (
          <>
            <TaskEditorActionLink icon="bx-download" href="#" tabIndex={-1} />
            <TaskEditorActionButton icon="bx-x" onClick={onFileRemove} tabIndex={-1} />
          </>
        )}
      </div>
    );
  }
};
