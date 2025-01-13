import classNames from "classnames";
import { useCallback } from "react";
import BoxIcon from "client/components/box_icon";
import {
  CommonAttachmentED,
  CommonEditorAddButton,
  CommonEditorAttachments,
  CommonEditorContent,
  CommonEditorDetails,
  CommonEditorInput,
  CommonEditorLabel,
  CommonEditorTableCell,
  CommonEditorTableHeader,
  EditorKind,
  useSimpleStringPropUpdater,
} from "client/components/common_editor";
import { getPath, Path } from "client/paths";
import { InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";
import { TaskCreditLocal, TaskCreditSaved, TaskED } from "./types";
import styles from "./task_editor.module.css";
import { TaskEditorSampleIO } from "./task_editor_sample_io";

type TaskEditorDetailsProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

export const TaskEditorDetails = ({ task, setTask }: TaskEditorDetailsProps) => {
  const onChangeTitle = useSimpleStringPropUpdater(task, setTask, "title");
  const onChangeSlug = useSimpleStringPropUpdater(task, setTask, "slug");
  const onChangeDescription = useSimpleStringPropUpdater(task, setTask, "description");

  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Title" />
        <CommonEditorInput type="text" value={task.title} onChange={onChangeTitle} />
        <CommonEditorLabel label="Slug" />
        <CommonEditorInput type="text" value={task.slug} onChange={onChangeSlug} />
        <CommonEditorLabel label="Description" />
        <CommonEditorInput
          type="textarea"
          value={task.description ?? ""}
          onChange={onChangeDescription}
          placeholder="Write a short summary about the task"
        />
        <CommonEditorLabel label="Sample I/O" />
        <TaskEditorSampleIO task={task} setTask={setTask} />
        <CommonEditorLabel label="Attachments" />
        <TaskEditorAttachments task={task} setTask={setTask} />
        <CommonEditorLabel label="Developer Credits" />
        <TaskEditorCredits task={task} setTask={setTask} />
        <CommonEditorLabel label="UUID" />
        <div className="text-gray-300">{task.id}</div>
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type TaskEditorAttachmentsProps = {
  task: TaskED;
  setTask(task: TaskED): void;
};

function TaskEditorAttachments({ task, setTask }: TaskEditorAttachmentsProps) {
  const curriedGetAttachmentURL = useCallback(
    (attachment: CommonAttachmentED) => {
      return getAttachmentURL(task, attachment);
    },
    [task]
  );

  const setAttachments = useCallback(
    (attachments: CommonAttachmentED[]) => {
      return setTask({
        ...task,
        attachments,
      });
    },
    [task]
  );

  const hint = (
    <>
      Access attachments at{" "}
      <span className="font-mono">/tasks/&#123;slug&#125;/attachments/&#123;...path&#125;</span>
    </>
  );

  return (
    <CommonEditorAttachments
      attachments={task.attachments}
      setAttachments={setAttachments}
      getAttachmentURL={curriedGetAttachmentURL}
      hint={hint}
    />
  );
}

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
        <CommonEditorTableHeader text="Name" />
        <CommonEditorTableHeader text="Role" />
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
        <CommonEditorAddButton onClick={onAddCredit} label="Add New" />
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
      <CommonEditorTableCell deleted={credit.deleted}>
        <input
          type="text"
          value={credit.name}
          onChange={onChangeName}
          className={classNames("w-full", credit.deleted && "line-through")}
        />
      </CommonEditorTableCell>
      <CommonEditorTableCell deleted={credit.deleted}>
        <input
          type="text"
          value={credit.role}
          onChange={onChangeRole}
          className={classNames("w-full", credit.deleted && "line-through")}
        />
      </CommonEditorTableCell>
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
      <CommonEditorTableCell deleted={false}>
        <input type="text" value={credit.name} onChange={onChangeName} className={"w-full"} />
      </CommonEditorTableCell>
      <CommonEditorTableCell deleted={false}>
        <input type="text" value={credit.role} onChange={onChangeRole} className={"w-full"} />
      </CommonEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

function getAttachmentURL(task: TaskED, attachment: CommonAttachmentED) {
  return getPath({ kind: Path.TaskAttachment, slug: task.slug, path: attachment.path });
}
