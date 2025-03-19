import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { APIPath, getAPIPath, getPath, Path } from "client/paths";
import {
  CommonEditorAttachments,
  CommonAttachmentED,
  useSimpleStringPropUpdater,
  CommonEditorLabel,
  CommonEditorInput,
  CommonEditorDetails,
  CommonEditorActionButton,
  CommonEditorTableCell,
  CommonEditorInputSubtle,
  CommonEditorAddButton,
  CommonEditorTableHeader,
  CommonEditorContent,
} from "client/components/common_editor";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { ButtonClickEvent, InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";
import http from "client/http";
import { TaskLookupDTO } from "common/types";
import { ContestED, ContestTaskED, ContestTaskTaskED } from "./types";
import styles from "./contest_editor.module.css";

type ContestEditorDetailsProps = {
  contest: ContestED;
  setContest(contest: ContestED): void;
};

export const ContestEditorDetails = ({ contest, setContest }: ContestEditorDetailsProps) => {
  const onChangeTitle = useSimpleStringPropUpdater(contest, setContest, "title");
  const onChangeSlug = useSimpleStringPropUpdater(contest, setContest, "slug");
  const onChangeDescription = useSimpleStringPropUpdater(contest, setContest, "description");

  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Title" />
        <CommonEditorInput type="text" value={contest.title} onChange={onChangeTitle} />
        <CommonEditorLabel label="Slug" />
        <CommonEditorInput type="text" value={contest.slug} onChange={onChangeSlug} />
        <CommonEditorLabel label="Description" />
        <CommonEditorInput
          type="textarea"
          value={contest.description ?? ""}
          onChange={onChangeDescription}
          placeholder="Write a short summary about the contest"
        />
        <CommonEditorLabel label="Attachments" />
        <ContestEditorAttachments contest={contest} setContest={setContest} />
        <CommonEditorLabel label="UUID" />
        <div className="text-gray-300">{contest.id}</div>
        <CommonEditorLabel label="Tasks" />
        <ContestEditorTasks contest={contest} setContest={setContest} />
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type ContestEditorAttachmentsProps = {
  contest: ContestED;
  setContest(contest: ContestED): void;
};

function ContestEditorAttachments({ contest, setContest }: ContestEditorAttachmentsProps) {
  const curriedGetAttachmentURL = useCallback(
    (attachment: CommonAttachmentED) => {
      return getAttachmentURL(contest, attachment);
    },
    [contest]
  );

  const setAttachments = useCallback(
    (attachments: CommonAttachmentED[]) => {
      return setContest({
        ...contest,
        attachments,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [contest]
  );

  const hint = (
    <>
      Access attachments at{" "}
      <span className="font-mono">/contests/&#123;slug&#125;/attachments/&#123;...path&#125;</span>
    </>
  );

  return (
    <CommonEditorAttachments
      attachments={contest.attachments}
      setAttachments={setAttachments}
      getAttachmentURL={curriedGetAttachmentURL}
      hint={hint}
    />
  );
}

type ContestEditorTasksProps = {
  contest: ContestED;
  setContest(contest: ContestED): void;
};

export const ContestEditorTasks = ({ contest, setContest }: ContestEditorTasksProps) => {
  const onAddTask = useCallback(() => {
    setContest({
      ...contest,
      tasks: [
        ...contest.tasks,
        {
          task: null,
          score_max: 0,
          letter: "",
          deleted: false,
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [contest]);

  return (
    <div className="flex flex-col gap-2">
      <div className={classNames(styles.tasks, "border border-gray-300 rounded-lg text-center")}>
        <CommonEditorTableHeader text="Letter" />
        <CommonEditorTableHeader text="Max Score" />
        <CommonEditorTableHeader text="Task" />
        <CommonEditorTableHeader text="Actions" />
        {contest.tasks.map((task, idx) => (
          <ContestTaskEditor
            key={idx}
            task={task}
            taskIndex={idx}
            contest={contest}
            setContest={setContest}
          />
        ))}
      </div>
      <div className="text-center">
        <CommonEditorAddButton label="Add Task" onClick={onAddTask} />
      </div>
    </div>
  );
};

type ContestTaskEditorProps = {
  task: ContestTaskED;
  taskIndex: number;
  contest: ContestED;
  setContest(contest: ContestED): void;
};

const ContestTaskEditor = ({ task, taskIndex, contest, setContest }: ContestTaskEditorProps) => {
  const [textScoreMax, setTextScoreMax] = useState<string>(task.score_max.toString());
  useEffect(() => {
    setTextScoreMax(task.score_max.toString());
  }, [task.score_max]);

  const replaceThisTask = useCallback(
    (newTask: ContestTaskED) => {
      setContest({
        ...contest,
        tasks: Arrays.replaceNth(contest.tasks, taskIndex, newTask),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [contest, taskIndex]
  );

  const onTaskLetterChange = useCallback(
    (event: InputChangeEvent) => {
      replaceThisTask({
        ...task,
        letter: event.target.value,
      });
    },
    [task, replaceThisTask]
  );

  const setTaskTask = useCallback(
    (value: ContestTaskTaskED | null) => {
      replaceThisTask({
        ...task,
        task: value,
      });
    },
    [task, replaceThisTask]
  );

  const onTaskScoreMaxChange = useCallback(
    (event: InputChangeEvent) => {
      setTextScoreMax(event.target.value);
      replaceThisTask({
        ...task,
        score_max: +event.target.value,
      });
    },
    [task, replaceThisTask]
  );

  const onTaskMoveUp = useCallback(() => {
    setContest({
      ...contest,
      tasks: Arrays.moveUp(contest.tasks, taskIndex),
    });
  }, [contest, taskIndex, setContest]);

  const onTaskMoveDown = useCallback(() => {
    setContest({
      ...contest,
      tasks: Arrays.moveDown(contest.tasks, taskIndex),
    });
  }, [contest, taskIndex, setContest]);

  const onTaskRemove = useCallback(() => {
    replaceThisTask({
      ...task,
      deleted: !task.deleted,
    });
  }, [task, replaceThisTask]);

  return (
    <>
      <CommonEditorTableCell>
        <CommonEditorInputSubtle
          value={task.letter}
          onChange={onTaskLetterChange}
          placeholder={`A${taskIndex + 1}`}
          className="w-full"
          disabled={task.deleted}
        />
      </CommonEditorTableCell>
      <CommonEditorTableCell>
        <CommonEditorInputSubtle
          value={textScoreMax}
          onChange={onTaskScoreMaxChange}
          className="w-full"
          disabled={task.deleted}
        />
      </CommonEditorTableCell>
      <CommonEditorTableCell>
        <ContestTaskPicker value={task.task} setValue={setTaskTask} />
      </CommonEditorTableCell>
      <CommonEditorTableCell>
        <CommonEditorActionButton size="bx-sm" icon="bx-chevron-up" onClick={onTaskMoveUp} />
        <CommonEditorActionButton size="bx-sm" icon="bx-chevron-down" onClick={onTaskMoveDown} />
        <CommonEditorActionButton size="bx-sm" icon="bx-x" onClick={onTaskRemove} />
      </CommonEditorTableCell>
    </>
  );
};

type ContestTaskPickerProps = {
  value: ContestTaskTaskED | null;
  setValue(value: ContestTaskTaskED | null): void;
};

const ContestTaskPicker = (props: ContestTaskPickerProps) => {
  const { value, setValue } = props;

  const [text, setText] = useState("");
  const [searching, setSearching] = useState(false);

  const onTextChange = useCallback(
    (event: InputChangeEvent) => {
      setText(event.target.value);
    },
    [setText]
  );

  const onTaskSearch = useCallback(async () => {
    if (searching) {
      return;
    }

    setSearching(true);
    const lookupURL = getAPIPath({ kind: APIPath.TaskLookup, id: text });
    try {
      const response: AxiosResponse<TaskLookupDTO> = await http.get(lookupURL);
      setValue(response.data);
    } catch (e) {
      if (e instanceof AxiosError && e.response != null && e.response.status == 404) {
        toast("Task does not exist", {
          type: "error",
        });
      }
    } finally {
      setSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [searching, text]);

  const onTaskClear = useCallback(() => {
    setValue(null);
  }, [setValue]);

  if (value == null) {
    return (
      <div className="flex mr-4">
        <CommonEditorInputSubtle
          className="flex-auto"
          value={text}
          onChange={onTextChange}
          placeholder="Task id or slug"
        />
        <CommonEditorActionButton size="bx-sm" icon="bx-search" onClick={onTaskSearch} />
      </div>
    );
  } else {
    const url = getPath({ kind: Path.TaskView, slug: value.slug });
    return (
      <div className="flex justify-center align-center mr-4">
        <Link
          className="text-blue-400 hover:text-blue-500 hover:underline"
          target="_blank"
          href={url}
        >
          {value.title}
        </Link>
        <CommonEditorActionButton size="bx-sm" icon="bx-x" onClick={onTaskClear} className="ml-2" />
      </div>
    );
  }
};

function getAttachmentURL(contest: ContestED, attachment: CommonAttachmentED) {
  return getPath({ kind: Path.ContestAttachment, slug: contest.slug, path: attachment.path });
}
