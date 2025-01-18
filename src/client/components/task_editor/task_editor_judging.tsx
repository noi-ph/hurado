import classNames from "classnames";
import { useCallback } from "react";
import { Scrollable } from "client/components/scrollable";
import { CommonEditorDetails, CommonEditorLabel, CommonEditorSelect, CommonEditorSection, EditorKind, CommonEditorInput } from "client/components/common_editor";
import styles from "client/components/common_editor/common_editor.module.css";
import { InputChangeEvent, SelectChangeEvent } from "common/types/events";
import { CheckerKind, Language, TaskFlavor, TaskType } from "common/types/constants";
import { TaskEditorSubtasks } from "./task_editor_subtasks";
import { TaskED, TaskScriptED } from "./types";
import { UnreachableError } from "common/errors";
import { TaskEditorScript } from "./task_editor_script";
import { createEmptyScript } from "./task_editor_utils";


type TaskEditorJudgingProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorJudging = ({ task, setTask }: TaskEditorJudgingProps) => {
  return (
    <Scrollable className={classNames(styles.content, "p-4")}>
      <CommonEditorDetails>
        <TaskTypeEditor task={task} setTask={setTask} />
        <CommonEditorSection title="Checker">
          <TaskCheckerEditor task={task} setTask={setTask} />
        </CommonEditorSection>
        <CommonEditorSection title="Limits">
          <TaskLimitsEditor task={task} setTask={setTask} />
        </CommonEditorSection>
      </CommonEditorDetails>
      <TaskEditorSubtasks task={task} setTask={setTask} />
    </Scrollable>
  );
};

const TaskTypeEditor = ({ task, setTask }: TaskEditorJudgingProps) => {
  const onChangeTaskType = useCallback(
    (event: SelectChangeEvent) => {
      const type = coerceTaskType(event.target.value);
      if (type === TaskType.Batch) {
        setTask({
          ...task,
          type: type,
          flavor: null,
          communicator: null,
        });
      } else if (type === TaskType.OutputOnly) {
        setTask({
          ...task,
          type: type,
          flavor: TaskFlavor.OutputText,
          communicator: null,
        });
      } else if (type === TaskType.Communication) {
        setTask({
          ...task,
          type: type,
          flavor: null,
          communicator: createEmptyScript(),
        });
      } else {
        throw new UnreachableError(type)
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

  const setCommunicatorScript = useCallback(
    (script: TaskScriptED) => {
      setTask({
        ...task,
        communicator: script,
      });
    },
    [task, setTask]
  );

  return (
    <>
      <CommonEditorLabel label="Task Type" />
      <CommonEditorSelect className="flex-auto" value={task.type} onChange={onChangeTaskType}>
        <option value={TaskType.Batch}>Batch</option>
        <option value={TaskType.Communication}>Communication</option>
        <option value={TaskType.OutputOnly}>Output Only</option>
      </CommonEditorSelect>
      {task.type === TaskType.OutputOnly && (
        <>
          <CommonEditorLabel label="Task Flavor" />
          <CommonEditorSelect
            className="flex-auto"
            value={task.flavor ?? TaskFlavor.OutputText}
            onChange={onChangeTaskFlavor}
          >
            <option value={TaskFlavor.OutputText}>Text Input</option>
            <option value={TaskFlavor.OutputFile}>File Upload</option>
          </CommonEditorSelect>
        </>
      )}
      {task.type === TaskType.Communication && (
        <CommonEditorSection title="Communicator">
          <TaskEditorScript script={task.communicator!} setScript={setCommunicatorScript}/>
        </CommonEditorSection>
      )}
    </>
  );
};

type TaskCheckerEditorProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskCheckerEditor = ({ task, setTask }: TaskCheckerEditorProps) => {
  const onChangeTaskChecker = useCallback(
    (event: SelectChangeEvent) => {
      const kind = coerceTaskCheckerKind(event.target.value);
      switch(kind) {
        case CheckerKind.LenientDiff:
          setTask({
            ...task,
            checker: { kind },
          })
          break;
        case CheckerKind.Custom:
            setTask({
              ...task,
              checker: {
                kind,
                script: {
                  kind: EditorKind.Local,
                  language: Language.Python3,
                  file_name: '',
                  file: null,
                  argv: [],
                },
              },
            })
            break;
        default:
          throw new UnreachableError(kind);
      }
    },
    [task]
  );

  const setCheckerScript = useCallback(
    (script: TaskScriptED) => {
      setTask({
        ...task,
        checker: {
          kind: CheckerKind.Custom,
          script,
        },
      });
    },
    [task, setTask]
  );

  return (
    <>
      <CommonEditorLabel label="Checker Type" />
      <CommonEditorSelect value={task.checker.kind} onChange={onChangeTaskChecker}>
        <option value={CheckerKind.LenientDiff}>Lenient Diff</option>
        <option value={CheckerKind.Custom}>Custom</option>
      </CommonEditorSelect>
      {task.checker.kind === CheckerKind.Custom && (
        <TaskEditorScript script={task.checker.script} setScript={setCheckerScript}/>
      )}
    </>
  );
};

type TaskLimitsEditorProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskLimitsEditor = ({ task, setTask }: TaskLimitsEditorProps) => {
  const onChangeTimeLimitMS = useCallback((event: InputChangeEvent) => {
    setTask({ ...task, time_limit_ms: event.target.value});
  }, [task]);

  const onChangeMemoryLimitByte = useCallback((event: InputChangeEvent) => {
    setTask({ ...task, memory_limit_byte: event.target.value});
  }, [task]);

  const onChangeCompileTimeLimitMS = useCallback((event: InputChangeEvent) => {
    setTask({ ...task, compile_time_limit_ms: event.target.value});
  }, [task]);

  const onChangeCompileMemoryLimitMS = useCallback((event: InputChangeEvent) => {
    setTask({ ...task, compile_memory_limit_byte: event.target.value});
  }, [task]);

  const onChangeSubmissionSizeLimitByte = useCallback((event: InputChangeEvent) => {
    setTask({ ...task, submission_size_limit_byte: event.target.value});
  }, [task]);

  return (
    <>
      <CommonEditorLabel label="Time Limit (ms)" />
      <CommonEditorInput
        type="text"
        value={task.time_limit_ms}
        onChange={onChangeTimeLimitMS}
        placeholder="3000"
      />
      <CommonEditorLabel label="Memory Limit (byte)" />
      <CommonEditorInput
        type="text"
        value={task.memory_limit_byte}
        onChange={onChangeMemoryLimitByte}
        placeholder="100000000"
      />
      <CommonEditorLabel label="Compile Time (ms)" />
      <CommonEditorInput
        type="text"
        value={task.compile_time_limit_ms}
        onChange={onChangeCompileTimeLimitMS}
        placeholder="10000"
      />
      <CommonEditorLabel label="Compile Memory (byte)" />
      <CommonEditorInput
        type="text"
        value={task.compile_memory_limit_byte}
        onChange={onChangeCompileMemoryLimitMS}
        placeholder="256000000"
      />
      <CommonEditorLabel label="Submission Size (byte)" />
      <CommonEditorInput
        type="text"
        value={task.submission_size_limit_byte}
        onChange={onChangeSubmissionSizeLimitByte}
        placeholder="64000"
      />
    </>
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


function coerceTaskCheckerKind(kind: string): CheckerKind {
  switch (kind) {
    case CheckerKind.LenientDiff:
    case CheckerKind.Custom:
      return kind;
    default:
      return CheckerKind.LenientDiff;
  }
}
