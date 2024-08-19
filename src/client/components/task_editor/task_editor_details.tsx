import classNames from "classnames";
import { useCallback, useRef } from "react";
import styles from "./task_editor.module.css";
import { InputChangeEvent, TextAreaChangeEvent } from "common/types/events";
import { UnreachableError } from "common/errors";
import BoxIcon from "../box_icon";
import { Scrollable } from "../scrollable";
import {
  EditorKind,
  TaskAttachmentLocal,
  TaskAttachmentSaved,
  TaskCreditLocal,
  TaskCreditSaved,
  TaskED,
  TaskFileLocal,
} from "./types";
import {
  destructivelyComputeSHA1,
  TaskEditorAddButton,
  TaskEditorInput,
  TaskEditorLabel,
  TaskEditorTableCell,
  useTaskStringPropUpdater,
} from "./task_editor_utils";
import { Arrays } from "common/utils/arrays";
import { getPath, Path } from "client/paths";
import { normalizeAttachmentPath } from "common/utils/attachments";

type TaskEditorDetailsProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorDetails = ({ task, setTask }: TaskEditorDetailsProps) => {
  const onChangeTitle = useTaskStringPropUpdater(task, setTask, "title");
  const onChangeSlug = useTaskStringPropUpdater(task, setTask, "slug");
  const onChangeDescription = useTaskStringPropUpdater(task, setTask, "description");

  return (
    <Scrollable className={styles.content}>
      <div className={classNames(styles.detailEditor, "p-4 gap-12")}>
        <TaskEditorLabel label="Title" />
        <TaskEditorInput type="text" value={task.title} onChange={onChangeTitle} />
        <TaskEditorLabel label="Slug" />
        <TaskEditorInput type="text" value={task.slug} onChange={onChangeSlug} />
        <TaskEditorLabel label="Description" />
        <TaskEditorInput
          type="textarea"
          value={task.description ?? ""}
          onChange={onChangeDescription}
          placeholder="Write a short summary about the task"
        />
        <TaskEditorLabel label="Attachments" />
        <TaskEditorAttachments task={task} setTask={setTask} />
        <TaskEditorLabel label="Developer Credits" />
        <TaskEditorCredits task={task} setTask={setTask} />
      </div>
    </Scrollable>
  );
};

type TaskEditorAttachmentsProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskEditorAttachments = ({ task, setTask }: TaskEditorAttachmentsProps) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const onFileSelect = useCallback(() => {
    if (pickerRef.current?.files == null) {
      return;
    }
    const newAttachments: TaskAttachmentLocal[] = [];
    for (const file of pickerRef.current.files) {
      const newFile: TaskFileLocal = {
        kind: EditorKind.Local,
        file,
        hash: "",
      };
      destructivelyComputeSHA1(newFile);
      const newAttachment: TaskAttachmentLocal = {
        kind: EditorKind.Local,
        file: newFile,
        path: file.name,
        filename: file.name,
        mime_type: file.type,
        deleted: false,
      };

      newAttachments.push(newAttachment);
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
            case EditorKind.Saved:
              return (
                <TaskAttachmentSavedX
                  key={idx}
                  task={task}
                  attachment={attachment}
                  setTask={setTask}
                  index={idx}
                />
              );
            case EditorKind.Local:
              return (
                <TaskAttachmentLocalX
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
      <div className="text-xs text-gray-500 mt-1">
        Access attachments at <span className="font-mono">/tasks/&#123;slug&#125;/attachments/&#123;...path&#125;</span>
      </div>
      <div className="flex justify-center mt-2">
        <TaskEditorAddButton onClick={onFileSelectStart} label="Add New" />
        <input
          type="file"
          className="hidden"
          ref={pickerRef}
          onChange={onFileSelect}
          multiple={true}
        />
      </div>
    </div>
  );
};

type TaskAttachmentSavedProps = {
  index: number;
  attachment: TaskAttachmentSaved;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskAttachmentSavedX = ({ index, attachment, task, setTask }: TaskAttachmentSavedProps) => {
  const onClickDelete = useCallback(() => {
    setTask({
      ...task,
      attachments: Arrays.replaceNth(task.attachments, index, {
        ...attachment,
        deleted: !attachment.deleted,
      }),
    });
  }, [task, attachment, index]);

  const filename = attachment.path.split("/").pop();
  return (
    <>
      <TaskEditorTableCell deleted={attachment.deleted}>{filename}</TaskEditorTableCell>
      <TaskEditorTableCell deleted={attachment.deleted}>{attachment.path}</TaskEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <a target="_blank" href={getAttachmentURL(task, attachment)}>
          <BoxIcon name="bx-download" className="bx-sm text-blue-300 hover:text-blue-500" />
        </a>
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type TaskAttachmentLocalProps = {
  index: number;
  attachment: TaskAttachmentLocal;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskAttachmentLocalX = ({ index, attachment, task, setTask }: TaskAttachmentLocalProps) => {
  const onChangePath = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        attachments: Arrays.replaceNth(task.attachments, index, {
          ...attachment,
          path: event.target.value,
        }),
      });
    },
    [task, attachment, index]
  );

  const onBlurPath = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        attachments: Arrays.replaceNth(task.attachments, index, {
          ...attachment,
          path: normalizeAttachmentPath(attachment.path),
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
      <TaskEditorTableCell deleted={false}>{attachment.filename}</TaskEditorTableCell>
      <TaskEditorTableCell deleted={false}>
        <input type="text" value={attachment.path} onBlur={onBlurPath} onChange={onChangePath} className="w-full" />
      </TaskEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type TaskEditorCreditsProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskEditorCredits = ({ task, setTask }: TaskEditorCreditsProps) => {
  const onAddCredit = useCallback(() => {
    setTask({
      ...task,
      credits: [
        ...task.credits,
        {
          kind: EditorKind.Local,
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
        {task.credits.map((credit, idx) =>
          credit.kind === EditorKind.Saved ? (
            <TaskEditorCreditSavedX
              key={idx}
              task={task}
              credit={credit}
              setTask={setTask}
              index={idx}
            />
          ) : (
            <TaskEditorCreditLocalX
              key={idx}
              task={task}
              credit={credit}
              setTask={setTask}
              index={idx}
            />
          )
        )}
      </div>
      <div className="flex justify-center mt-2">
        <TaskEditorAddButton onClick={onAddCredit} label="Add New" />
      </div>
    </div>
  );
};

type TaskEditorCreditSavedProps = {
  index: number;
  credit: TaskCreditSaved;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskEditorCreditSavedX = ({ index, credit, task, setTask }: TaskEditorCreditSavedProps) => {
  const onChangeName = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        credits: Arrays.replaceNth(task.credits, index, {
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
        credits: Arrays.replaceNth(task.credits, index, {
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
      credits: Arrays.replaceNth(task.credits, index, {
        ...credit,
        deleted: !credit.deleted,
      }),
    });
  }, [task, credit, index]);

  return (
    <>
      <TaskEditorTableCell deleted={credit.deleted}>
        <input
          type="text"
          value={credit.name}
          onChange={onChangeName}
          className={classNames("w-full", credit.deleted && "line-through")}
        />
      </TaskEditorTableCell>
      <TaskEditorTableCell deleted={credit.deleted}>
        <input
          type="text"
          value={credit.role}
          onChange={onChangeRole}
          className={classNames("w-full", credit.deleted && "line-through")}
        />
      </TaskEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type TaskEditorCreditLocalProps = {
  index: number;
  credit: TaskCreditLocal;
  task: TaskED;
  setTask(task: TaskED): void;
};

const TaskEditorCreditLocalX = ({ index, credit, task, setTask }: TaskEditorCreditLocalProps) => {
  const onChangeName = useCallback(
    (event: InputChangeEvent) => {
      setTask({
        ...task,
        credits: Arrays.replaceNth(task.credits, index, {
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
        credits: Arrays.replaceNth(task.credits, index, {
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
      credits: [...task.credits.slice(0, index), ...task.credits.slice(index + 1)],
    });
  }, [task, credit, index]);

  return (
    <>
      <TaskEditorTableCell deleted={false}>
        <input type="text" value={credit.name} onChange={onChangeName} className={"w-full"} />
      </TaskEditorTableCell>
      <TaskEditorTableCell deleted={false}>
        <input type="text" value={credit.role} onChange={onChangeRole} className={"w-full"} />
      </TaskEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

function getAttachmentURL(task: TaskED, attachment: TaskAttachmentSaved) {
  return getPath({ kind: Path.TaskAttachment, slug: task.slug, path: attachment.path});
}
