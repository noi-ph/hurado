import classNames from "classnames";
import { MouseEvent, useCallback, useRef } from "react";
import {
  TaskEditorCredit,
  TaskEditorAttachmentKind,
  TaskEditorAttachmentPending,
  TaskEditorAttachmentSaved,
  TaskEditorTask,
} from "common/types";
import styles from "./task_editor.module.css";
import { InputChangeEvent, TextAreaChangeEvent } from "common/types/events";
import { UnreachableError } from "common/errors";
import BoxIcon from "../box_icon";
import { Scrollable } from "../scrollable";

type TaskEditorDetailsProps = {
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

export const TaskEditorDetails = ({ task, setTask }: TaskEditorDetailsProps) => {
  const onChangeTitle = useTaskUpdaterText(task, setTask, "title");
  const onChangeSlug = useTaskUpdaterText(task, setTask, "slug");
  const onChangeDescription = useTaskUpdaterText(task, setTask, "description");

  return (
    <Scrollable className={styles.content}>
      <div className={classNames(styles.detailEditor, "p-4 gap-12")}>
        <TaskDetailProperty name="Title" />
        <TaskDetailInput type="text" value={task.title} onChange={onChangeTitle} />
        <TaskDetailProperty name="Slug" />
        <TaskDetailInput type="text" value={task.slug} onChange={onChangeSlug} />
        <TaskDetailProperty name="Description" />
        <TaskDetailInput
          type="textarea"
          value={task.description ?? ""}
          onChange={onChangeDescription}
          placeholder="Write a short summary about the task"
        />
        <TaskDetailProperty name="Attachments" />
        <TaskEditorAttachments task={task} setTask={setTask} />
        <TaskDetailProperty name="Developer Credits" />
        <TaskEditorCredits task={task} setTask={setTask} />
      </div>
    </Scrollable>
  );
};

type TaskDetailPropertyProps = {
  name: string;
};

const TaskDetailProperty = ({ name }: TaskDetailPropertyProps) => {
  return <div className="text-lg text-gray-500">{name}</div>;
};

type TaskDetailInputProps = {
  value: string;
  onChange(event: InputChangeEvent | TextAreaChangeEvent): void;
  placeholder?: string;
  type: "text" | "textarea";
};

const TaskDetailInput = ({ type, value, onChange, placeholder }: TaskDetailInputProps) => {
  if (type == "text") {
    return (
      <input
        className="font-mono p-2 border border-gray-300 rounded-lg"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  } else {
    return (
      <textarea
        className="font-mono p-2 border border-gray-300 rounded-lg h-24"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
};

type TaskEditorAttachmentsProps = {
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

const TaskEditorAttachments = ({ task, setTask }: TaskEditorAttachmentsProps) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const onFileSelected = useCallback(() => {
    if (pickerRef.current?.files == null) {
      return;
    }
    const newAttachments: TaskEditorAttachmentPending[] = [];
    for (const file of pickerRef.current.files) {
      newAttachments.push({
        kind: TaskEditorAttachmentKind.Pending,
        file,
        path: file.name,
      });
    }

    setTask({
      ...task,
      attachments: [...task.attachments, ...newAttachments],
    });
  }, [task]);

  const onFileSelectStart = useCallback(() => {
    if (pickerRef.current?.files == null) {
      return;
    }
    pickerRef.current.click();
  }, [task]);

  return (
    <div>
      <div
        className={classNames(styles.attachments, "border border-gray-300 rounded-lg text-center")}
      >
        <div className="text-gray-500 font-roboto font-medium">File Name</div>
        <div className="text-gray-500 font-roboto font-medium">Path</div>
        <div /> {/* Actions header placeholder */}
        {task.attachments.map((attachment, idx) => {
          switch (attachment.kind) {
            case TaskEditorAttachmentKind.Saved:
              return (
                <TaskEditorAttachmentSavedX
                  key={idx}
                  task={task}
                  attachment={attachment}
                  setTask={setTask}
                  index={idx}
                />
              );
            case TaskEditorAttachmentKind.Pending:
              return (
                <TaskEditorAttachmentPendingX
                  key={idx}
                  task={task}
                  attachment={attachment}
                  setTask={setTask}
                  index={idx}
                />
              );
            default:
              throw new UnreachableError(attachment);
          }
        })}
      </div>
      <div className="flex justify-center mt-2">
        <DetailTableAdd onClick={onFileSelectStart} label="Add New" />
        <input
          type="file"
          className="hidden"
          ref={pickerRef}
          onChange={onFileSelected}
          multiple={true}
        />
      </div>
    </div>
  );
};

type TaskEditorAttachmentSavedProps = {
  index: number;
  attachment: TaskEditorAttachmentSaved;
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

const TaskEditorAttachmentSavedX = ({
  index,
  attachment,
  task,
  setTask,
}: TaskEditorAttachmentSavedProps) => {
  const onClickDelete = useCallback(() => {
    setTask({
      ...task,
      attachments: replaceNth(task.attachments, index, {
        ...attachment,
        deleted: !attachment.deleted,
      }),
    });
  }, [task, attachment, index]);

  const filename = attachment.path.split("/").pop();
  return (
    <>
      <DetailTableEntry deleted={attachment.deleted}>{filename}</DetailTableEntry>
      <DetailTableEntry deleted={attachment.deleted}>{attachment.path}</DetailTableEntry>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <a href={getAttachmentURL(attachment)}>
          <BoxIcon name="bx-download" className="bx-sm text-blue-300 hover:text-blue-500" />
        </a>
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type TaskEditorAttachmentPendingProps = {
  index: number;
  attachment: TaskEditorAttachmentPending;
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

const TaskEditorAttachmentPendingX = ({
  index,
  attachment,
  task,
  setTask,
}: TaskEditorAttachmentPendingProps) => {
  const onChangePath = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        attachments: replaceNth(task.attachments, index, {
          ...attachment,
          path: event.target.value,
        }),
      });
    },
    [task, attachment, index]
  );

  const onClickDelete = useCallback(() => {
    setTask({
      ...task,
      attachments: [...task.attachments.slice(0, index), ...task.attachments.slice(index + 1)],
    });
  }, [task, attachment, index]);

  return (
    <>
      <DetailTableEntry deleted={false}>{attachment.file.name}</DetailTableEntry>
      <DetailTableEntry deleted={false}>
        <input type="text" value={attachment.path} onChange={onChangePath} className="w-full" />
      </DetailTableEntry>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type TaskEditorCreditsProps = {
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

const TaskEditorCredits = ({ task, setTask }: TaskEditorCreditsProps) => {
  const onAddCredit = useCallback(() => {
    setTask({
      ...task,
      credits: [
        ...task.credits,
        {
          name: "Kevin",
          role: "Author",
          deleted: false,
        },
      ],
    });
  }, [task]);

  return (
    <div>
      <div className={classNames(styles.credits, "border border-gray-300 rounded-lg text-center")}>
        <div className="text-gray-500 font-roboto font-medium">Name</div>
        <div className="text-gray-500 font-roboto font-medium">Role</div>
        <div /> {/* Actions header placeholder */}
        {task.credits.map((credit, idx) => (
          <TaskEditorCreditSingle
            key={idx}
            task={task}
            credit={credit}
            setTask={setTask}
            index={idx}
          />
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <DetailTableAdd onClick={onAddCredit} label="Add New" />
      </div>
    </div>
  );
};

type TaskEditorCreditSingleProps = {
  index: number;
  credit: TaskEditorCredit;
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

const TaskEditorCreditSingle = ({ index, credit, task, setTask }: TaskEditorCreditSingleProps) => {
  const onChangeName = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        credits: replaceNth(task.credits, index, {
          ...credit,
          name: event.target.value,
        }),
      });
    },
    [task, credit, index]
  );

  const onChangeRole = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        credits: replaceNth(task.credits, index, {
          ...credit,
          role: event.target.value,
        }),
      });
    },
    [task, credit, index]
  );

  const onClickDelete = useCallback(() => {
    setTask({
      ...task,
      credits: replaceNth(task.credits, index, {
        ...credit,
        deleted: !credit.deleted,
      }),
    });
  }, [task, credit, index]);

  return (
    <>
      <DetailTableEntry deleted={credit.deleted}>
        <input
          type="text"
          value={credit.name}
          onChange={onChangeName}
          className={classNames("w-full", credit.deleted && "line-through")}
        />
      </DetailTableEntry>
      <DetailTableEntry deleted={credit.deleted}>
        <input
          type="text"
          value={credit.role}
          onChange={onChangeRole}
          className={classNames("w-full", credit.deleted && "line-through")}
        />
      </DetailTableEntry>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type DetailTableEntryProps = {
  children: React.ReactNode;
  deleted: boolean;
};

const DetailTableEntry = ({ deleted, children }: DetailTableEntryProps) => {
  return (
    <div className={classNames("font-roboto font-light text-gray-500", deleted && "line-through")}>
      {children}
    </div>
  );
};

type DetailTableAddProps = {
  label: string;
  onClick(): void;
};

const DetailTableAdd = ({ onClick, label }: DetailTableAddProps) => {
  return (
    <button
      onClick={onClick}
      className="py-1 px-3 rounded-lg border border-gray-300 font-roboto font-light text-gray-500 hover:text-gray-800 hover:border-gray-500"
    >
      <BoxIcon name="bx-plus" className="bx-xs mt-1" />
      {label}
    </button>
  );
};

function useTaskUpdaterText(
  task: TaskEditorTask,
  setTask: (t: TaskEditorTask) => void,
  key: keyof TaskEditorTask
) {
  return useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        [key as string]: event.target.value,
      });
    },
    [task, setTask]
  );
}

function replaceNth<T>(arr: T[], index: number, value: T) {
  return arr.slice(0, index).concat(value, ...arr.slice(index + 1));
}

function getAttachmentURL(attachment: TaskEditorAttachmentSaved) {
  // TODO: Implement this when file uploads actually work
  return `#${attachment.path}`;
}
