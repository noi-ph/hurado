"use client";

import { AxiosError, AxiosResponse } from "axios";
import classNames from "classnames";
import Link from "next/link";
import { ReactNode, memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { Navbar } from "client/components/navbar";
import {
  CommonEditorFooter,
  CommonEditorTitle,
  CommonEditorPage,
  CommonEditorContent,
  CommonEditorDetails,
  CommonEditorLabel,
  CommonEditorInput,
  CommonEditorTableHeader,
  CommonEditorAddButton,
  CommonEditorTableCell,
  CommonEditorInputSubtle,
  CommonEditorActionButton,
  useSimpleStringPropUpdater,
  CommonEditorTabComponent,
  CommonEditorTabItem,
  getLocationHash,
  CommonEditorViewLink,
} from "client/components/common_editor";
import commonStyles from "client/components/common_editor/common_editor.module.css";
import http from "client/http";
import { APIPath, getAPIPath, getPath, Path } from "client/paths";
import { TaskLookupDTO } from "common/types";
import { InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";
import { ProblemSetEditorDTO } from "common/validation/problem_set_validation";
import { ProblemSetED, ProblemSetTaskED } from "./types";
import { coerceProblemSetED } from "./problem_set_coercion";
import { saveProblemSet } from "./problem_set_editor_saving";
import styles from "./problem_set_editor.module.css";

type ProblemSetEditorProps = {
  dto: ProblemSetEditorDTO;
};

export const ProblemSetEditor = ({ dto }: ProblemSetEditorProps) => {
  const initialProblemSet = useMemo(() => {
    return coerceProblemSetED(dto);
  }, [dto]);
  const [tab, setTab] = useState(coerceProblemSetEditorTab(getLocationHash()));
  const [problemSet, setProblemSet] = useState<ProblemSetED>(initialProblemSet);
  const [isMounted, setIsMounted] = useState(false);

  // hacks copy-pasted from the task editor!

  // NextJS hack to detect when hash changes and run some code
  // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
  const params = useParams();
  useEffect(() => {
    const currentTab = coerceProblemSetEditorTab(getLocationHash());
    setTab(currentTab);
    setIsMounted(true);
  }, [params]);

  // Hack to skip the hydration error
  if (!isMounted) {
    return null;
  }

  let content: ReactNode = null;
  switch (tab) {
    case ProblemSetEditorTab.Details:
      content = <ProblemSetEditorDetails problemSet={problemSet} setProblemSet={setProblemSet} />;
      break;
    case ProblemSetEditorTab.Advanced:
      content = <ProblemSetEditorAdvanced problemSet={problemSet} setProblemSet={setProblemSet}/>;
      break;
    default:
      content = null;
  }

  return (
    <CommonEditorPage isStatement={false}>
      <Navbar className={commonStyles.header} />
      <CommonEditorTitle title={problemSet.title} slug={problemSet.slug} />
      <ProblemSetEditorTabComponent tab={tab} slug={problemSet.slug}/>
      {content}
      <CommonEditorFooter
        object={problemSet}
        setObject={setProblemSet}
        initial={initialProblemSet}
        saveObject={saveProblemSet}
      />
    </CommonEditorPage>
  );
};


type ProblemSetEditorDetailsProps = {
  problemSet: ProblemSetED;
  setProblemSet(problemSet: ProblemSetED): void;
};

export const ProblemSetEditorDetails = ({ problemSet, setProblemSet }: ProblemSetEditorDetailsProps) => {
  const onChangeTitle = useSimpleStringPropUpdater(problemSet, setProblemSet, "title");
  const onChangeSlug = useSimpleStringPropUpdater(problemSet, setProblemSet, "slug");
  const onChangeDescription = useSimpleStringPropUpdater(problemSet, setProblemSet, "description");

  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Title" />
        <CommonEditorInput type="text" value={problemSet.title} onChange={onChangeTitle} />
        <CommonEditorLabel label="Slug" />
        <CommonEditorInput type="text" value={problemSet.slug} onChange={onChangeSlug} />
        <CommonEditorLabel label="Description" />
        <CommonEditorInput
          type="textarea"
          value={problemSet.description ?? ""}
          onChange={onChangeDescription}
          placeholder="Write a short summary about the problemSet"
        />
        <CommonEditorLabel label="UUID" />
        <div className="text-gray-300">{problemSet.id}</div>
        <CommonEditorLabel label="Tasks" />
        <ProblemSetEditorTasks problemSet={problemSet} setProblemSet={setProblemSet} />
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};


type ProblemSetEditorTasksProps = {
  problemSet: ProblemSetED;
  setProblemSet(problemSet: ProblemSetED): void;
};

export const ProblemSetEditorTasks = ({ problemSet, setProblemSet }: ProblemSetEditorTasksProps) => {
  const onAddTask = useCallback(() => {
    setProblemSet({
      ...problemSet,
      tasks: [
        ...problemSet.tasks,
        {
          id: '',
          slug: '',
          title: '',
          deleted: false,
        },
      ],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [problemSet]);

  return (
    <div className="flex flex-col gap-2">
      <div className={classNames(styles.tasks, "border border-gray-300 rounded-lg text-center")}>
        <CommonEditorTableHeader text="Task" />
        <CommonEditorTableHeader text="Actions" />
        {problemSet.tasks.map((task, idx) => (
          <ProblemSetTaskEditor
            key={idx}
            task={task}
            taskIndex={idx}
            problemSet={problemSet}
            setProblemSet={setProblemSet}
          />
        ))}
      </div>
      <div className="text-center">
        <CommonEditorAddButton label="Add Task" onClick={onAddTask} />
      </div>
    </div>
  );
};

type ProblemSetTaskEditorProps = {
  task: ProblemSetTaskED;
  taskIndex: number;
  problemSet: ProblemSetED;
  setProblemSet(problemSet: ProblemSetED): void;
};

const ProblemSetTaskEditor = ({ task, taskIndex, problemSet, setProblemSet }: ProblemSetTaskEditorProps) => {
  const replaceThisTask = useCallback(
    (newTask: ProblemSetTaskED) => {
      setProblemSet({
        ...problemSet,
        tasks: Arrays.replaceNth(problemSet.tasks, taskIndex, newTask),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [problemSet, taskIndex]
  );

  const setThisTask = useCallback(
    (value: ProblemSetTaskED | null) => {
      if (value == null) {
        // empty id means it doesn't point to a task
        replaceThisTask({
          id: '',
          slug: '',
          title: '',
          deleted: task.deleted,
        });
        return;
      }
      replaceThisTask(value);
    },
    [task, replaceThisTask]
  );

  const onTaskMoveUp = useCallback(() => {
    setProblemSet({
      ...problemSet,
      tasks: Arrays.moveUp(problemSet.tasks, taskIndex),
    });
  }, [problemSet, taskIndex, setProblemSet]);

  const onTaskMoveDown = useCallback(() => {
    setProblemSet({
      ...problemSet,
      tasks: Arrays.moveDown(problemSet.tasks, taskIndex),
    });
  }, [problemSet, taskIndex, setProblemSet]);

  const onTaskRemove = useCallback(() => {
    replaceThisTask({
      ...task,
      deleted: !task.deleted,
    });
  }, [task, replaceThisTask]);

  return (
    <>
      <CommonEditorTableCell>
        <ProblemSetTaskPicker value={task} setValue={setThisTask} />
      </CommonEditorTableCell>
      <CommonEditorTableCell>
        <CommonEditorActionButton size="bx-sm" icon="bx-chevron-up" onClick={onTaskMoveUp} />
        <CommonEditorActionButton size="bx-sm" icon="bx-chevron-down" onClick={onTaskMoveDown} />
        <CommonEditorActionButton size="bx-sm" icon="bx-x" onClick={onTaskRemove} />
      </CommonEditorTableCell>
    </>
  );
};

type ProblemSetTaskPickerProps = {
  value: ProblemSetTaskED;
  setValue(value: ProblemSetTaskED | null): void;
};

const ProblemSetTaskPicker = (props: ProblemSetTaskPickerProps) => {
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
      setValue({
        id: response.data.id,
        slug: response.data.slug,
        title: response.data.title,
        deleted: false,
      });
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

  if (!value.id) {
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


export enum ProblemSetEditorTab {
  Details = "details",
  Advanced = "advanced",
}

type ProblemSetEditorTabProps = {
  tab: ProblemSetEditorTab;
  slug: string;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const ProblemSetEditorTabComponent = memo(({ tab, slug }: ProblemSetEditorTabProps) => {
  const viewURL = getPath({ kind: Path.ProblemSetView, slug });

  return (
    <CommonEditorTabComponent>
      <CommonEditorTabItem tab={ProblemSetEditorTab.Details} current={tab} label="Details"/>
      <CommonEditorTabItem tab={ProblemSetEditorTab.Advanced} current={tab} label="Advanced"/>
      <CommonEditorViewLink slug={slug} label="View" url={viewURL} />
    </CommonEditorTabComponent>
  );
});

export function coerceProblemSetEditorTab(hash: string): ProblemSetEditorTab {
  const split = hash.split("#");
  const real = split.length >= 2 ? split[1] : "";
  switch (real) {
    case ProblemSetEditorTab.Details:
    case ProblemSetEditorTab.Advanced:
      return real;
    default:
      return ProblemSetEditorTab.Details;
  }
}

type ProblemSetEditorAdvancedProps = {
  problemSet: ProblemSetED;
  setProblemSet(problemSet: ProblemSetED): void;
};

export const ProblemSetEditorAdvanced = ({ problemSet, setProblemSet }: ProblemSetEditorAdvancedProps) => {
  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Is Public?" />
        <ProblemSetEditorPublic problemSet={problemSet} setProblemSet={setProblemSet}/>
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type ProblemSetEditorPublicProps = {
  problemSet: ProblemSetED;
  setProblemSet(problemSet: ProblemSetED): void;
}
export const ProblemSetEditorPublic = ({ problemSet, setProblemSet }: ProblemSetEditorPublicProps) => {
  const onChangePublic = useCallback(
    (event: InputChangeEvent) => {
      setProblemSet({
        ...problemSet,
        is_public: event.target.checked,
      });
    },
    [problemSet, setProblemSet]
  );
  return (
    <>
      <input
        type='checkbox'
        className="border-2 border-gray-250 rounded-md h-6 w-6 self-center"
        checked={problemSet.is_public}
        onChange={onChangePublic}
      />
    </>
  );
}