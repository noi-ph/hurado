import classNames from "classnames";
import { useCallback, useRef } from "react";
import {
  TaskCredit,
  TaskEditorAttachment,
  TaskEditorAttachmentKind,
  TaskEditorAttachmentPending,
  TaskEditorTask,
} from "common/types";
import styles from "./task_editor.module.css";
import { InputChangeEvent, TextAreaChangeEvent } from "common/types/events";
import { UnreachableError } from "common/errors";

type TaskEditorDetailsProps = {
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

export const TaskEditorDetails = ({ task, setTask }: TaskEditorDetailsProps) => {
  const onChangeTitle = useTaskUpdaterText(task, setTask, "title");
  const onChangeSlug = useTaskUpdaterText(task, setTask, "slug");
  const onChangeDescription = useTaskUpdaterText(task, setTask, "description");

  return (
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
      <div className={classNames(styles.attachments, "border border-gray-300 rounded-lg text-center")}>
        <div className="text-gray-500 font-roboto font-medium">File Name</div>
        <div className="text-gray-500 font-roboto font-medium">Path</div>
        <div/> {/* Actions header placeholder */}
        {task.attachments.map((attachment, idx) => (
          <TaskEditorAttachmentSingle
            key={idx}
            task={task}
            attachment={attachment}
            setTask={setTask}
            index={idx}
          />
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <button
          onClick={onFileSelectStart}
          className="py-1 px-3 rounded-lg border border-gray-300 font-roboto font-light text-gray-500 hover:text-gray-800 hover:border-gray-500"
        >
          Add New
        </button>
        <input type="file" className="hidden" ref={pickerRef} onChange={onFileSelected} multiple={true}/>
      </div>
    </div>
  );
};

type TaskEditorAttachmentSingleProps = {
  index: number;
  attachment: TaskEditorAttachment;
  task: TaskEditorTask;
  setTask(task: TaskEditorTask): void;
};

const TaskEditorAttachmentSingle = ({
  index,
  attachment,
  task,
  setTask,
}: TaskEditorAttachmentSingleProps) => {
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

  if (attachment.kind === TaskEditorAttachmentKind.Saved) {
    const filename = attachment.path.split('/').pop();
    return (
      <>
        <div className="font-roboto font-light text-gray-500">{filename}</div>
        <div className="font-roboto font-light text-gray-500">{attachment.path}</div>
        <div className=""/>
      </>
    );
  } else if (attachment.kind === TaskEditorAttachmentKind.Pending) {
    return (
      <>
        <div className="font-roboto font-light text-gray-500">{attachment.file.name}</div>
        <div>
          <input
            type="text"
            value={attachment.path}
            onChange={onChangePath}
            className="w-full font-roboto font-light text-gray-500"
          />
        </div>
        <div className=""></div>
      </>
    );
  } else {
    throw new UnreachableError(attachment);
  }
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
        },
      ],
    });
  }, [task]);

  return (
    <div>
      <div className={classNames(styles.credits, "border border-gray-300 rounded-lg text-center")}>
        <div className="text-gray-500 font-roboto font-medium">Name</div>
        <div className="text-gray-500 font-roboto font-medium">Role</div>
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
        <button
          onClick={onAddCredit}
          className="py-1 px-3 rounded-lg border border-gray-300 font-roboto font-light text-gray-500 hover:text-gray-800 hover:border-gray-500"
        >
          Add New
        </button>
      </div>
    </div>
  );
};

type TaskEditorCreditSingleProps = {
  index: number;
  credit: TaskCredit;
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

  return (
    <>
      <div>
        <input
          type="text"
          value={credit.name}
          onChange={onChangeName}
          className="w-full font-roboto font-light text-gray-500"
        />
      </div>
      <div>
        <input
          type="text"
          value={credit.role}
          onChange={onChangeRole}
          className="w-full font-roboto font-light text-gray-500"
        />
      </div>
    </>
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
