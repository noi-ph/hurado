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
import { ChildLookupDTO } from "common/types";
import { InputChangeEvent } from "common/types/events";
import { Arrays } from "common/utils/arrays";
import { ProblemSetEditorDTO } from "common/validation/problem_set_validation";
import { ProblemSetED, ProblemSetChildED } from "./types";
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
  const [origProbSet] = useState<ProblemSetED>(initialProblemSet);
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
      content = <ProblemSetEditorAdvanced problemSet={problemSet} setProblemSet={setProblemSet} />;
      break;
    default:
      content = null;
  }

  return (
    <CommonEditorPage isStatement={false}>
      <Navbar className={commonStyles.header} />
      <CommonEditorTitle title={problemSet.title} slug={problemSet.slug} />
      <ProblemSetEditorTabComponent tab={tab} slug={problemSet.slug} />
      {content}
      <CommonEditorFooter
        origObject={origProbSet}
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

export const ProblemSetEditorDetails = ({
  problemSet,
  setProblemSet,
}: ProblemSetEditorDetailsProps) => {
  const onChangeTitle = useSimpleStringPropUpdater(problemSet, setProblemSet, "title");
  const onChangeSlug = useSimpleStringPropUpdater(problemSet, setProblemSet, "slug");
  const onChangeDescription = useSimpleStringPropUpdater(problemSet, setProblemSet, "description");

  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Title" />
        <CommonEditorInput type="text" value={problemSet.title} onChange={onChangeTitle} />
        <CommonEditorLabel label="Slug" />
        <CommonEditorInput
          type="text"
          value={problemSet.slug}
          onChange={onChangeSlug}
          disabled={problemSet.slug === "root"}
        />
        <CommonEditorLabel label="Description" />
        <CommonEditorInput
          type="textarea"
          value={problemSet.description ?? ""}
          onChange={onChangeDescription}
          placeholder="Write a short summary about the problemSet"
        />
        <CommonEditorLabel label="UUID" />
        <div className="text-gray-300">{problemSet.id}</div>
        <CommonEditorLabel label="Nested Sets" />
        <ProblemSetEditorChildren
          problemSet={problemSet}
          args={{
            setChildren: (problemSet: ProblemSetED, children: ProblemSetChildED[]) => {
              setProblemSet({
                ...problemSet,
                nesteds: children,
              });
            },
            childrenOf: (problemSet: ProblemSetED) => problemSet.nesteds,
            label: "Nested Set",
            viewPath: Path.ProblemSetView,
            lookupPath: APIPath.ProblemSetLookup,
          }}
        />
        <CommonEditorLabel label="Tasks" />
        <ProblemSetEditorChildren
          problemSet={problemSet}
          args={{
            setChildren: (problemSet: ProblemSetED, children: ProblemSetChildED[]) => {
              setProblemSet({
                ...problemSet,
                tasks: children,
              });
            },
            childrenOf: (problemSet: ProblemSetED) => problemSet.tasks,
            label: "Task",
            viewPath: Path.TaskView,
            lookupPath: APIPath.TaskLookup,
          }}
        />
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type ChildArgs = {
  setChildren(problemSet: ProblemSetED, children: ProblemSetChildED[]): void;
  childrenOf(problemSet: ProblemSetED): ProblemSetChildED[];
  label: string;
  viewPath: Path.TaskView | Path.ProblemSetView;
  lookupPath: APIPath.TaskLookup | APIPath.ProblemSetLookup;
};

type ProblemSetEditorChildrenProps = {
  problemSet: ProblemSetED;
  args: ChildArgs;
};

export const ProblemSetEditorChildren = ({ problemSet, args }: ProblemSetEditorChildrenProps) => {
  const { label, setChildren, childrenOf } = args;
  const onAddChild = useCallback(() => {
    setChildren(problemSet, [
      ...childrenOf(problemSet),
      {
        id: "",
        slug: "",
        title: "",
        deleted: false,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [problemSet]);

  return (
    <div className="flex flex-col gap-2">
      <div className={classNames(styles.tasks, "border border-gray-300 rounded-lg text-center")}>
        <CommonEditorTableHeader text={label} />
        <CommonEditorTableHeader text="Actions" />
        {childrenOf(problemSet).map((child, idx) => (
          <ProblemSetChildEditor
            key={idx}
            child={child}
            index={idx}
            problemSet={problemSet}
            args={args}
          />
        ))}
      </div>
      <div className="text-center">
        <CommonEditorAddButton label={`Add ${label}`} onClick={onAddChild} />
      </div>
    </div>
  );
};

type ProblemSetChildEditorProps = {
  child: ProblemSetChildED;
  index: number;
  problemSet: ProblemSetED;
  args: ChildArgs;
};

const ProblemSetChildEditor = ({ child, index, problemSet, args }: ProblemSetChildEditorProps) => {
  const { childrenOf, setChildren } = args;
  const replaceThisChild = useCallback(
    (newChild: ProblemSetChildED) => {
      setChildren(problemSet, Arrays.replaceNth(childrenOf(problemSet), index, newChild));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [problemSet, index]
  );

  const setThisChild = useCallback(
    (value: ProblemSetChildED | null) => {
      if (value == null) {
        // empty id means it doesn't point to a task
        replaceThisChild({
          id: "",
          slug: "",
          title: "",
          deleted: child.deleted,
        });
        return;
      }
      replaceThisChild(value);
    },
    [child, replaceThisChild]
  );

  const onChildMoveUp = useCallback(() => {
    setChildren(problemSet, Arrays.moveUp(childrenOf(problemSet), index));
  }, [problemSet, index, setChildren, childrenOf]);

  const onChildMoveDown = useCallback(() => {
    setChildren(problemSet, Arrays.moveDown(childrenOf(problemSet), index));
  }, [problemSet, index, setChildren, childrenOf]);

  const onChildRemove = useCallback(() => {
    replaceThisChild({
      ...child,
      deleted: !child.deleted,
    });
  }, [child, replaceThisChild]);

  return (
    <>
      <CommonEditorTableCell>
        <ProblemSetChildPicker value={child} setValue={setThisChild} args={args} />
      </CommonEditorTableCell>
      <CommonEditorTableCell>
        <CommonEditorActionButton size="bx-sm" icon="bx-chevron-up" onClick={onChildMoveUp} />
        <CommonEditorActionButton size="bx-sm" icon="bx-chevron-down" onClick={onChildMoveDown} />
        <CommonEditorActionButton size="bx-sm" icon="bx-x" onClick={onChildRemove} />
      </CommonEditorTableCell>
    </>
  );
};

type ProblemSetChildPickerProps = {
  value: ProblemSetChildED;
  setValue(value: ProblemSetChildED | null): void;
  args: ChildArgs;
};

const ProblemSetChildPicker = (props: ProblemSetChildPickerProps) => {
  const { value, setValue, args } = props;
  const { label, viewPath, lookupPath } = args;
  const [text, setText] = useState("");
  const [searching, setSearching] = useState(false);

  const onTextChange = useCallback(
    (event: InputChangeEvent) => {
      setText(event.target.value);
    },
    [setText]
  );

  const onChildSearch = useCallback(async () => {
    if (searching) {
      return;
    }

    setSearching(true);
    const lookupURL = getAPIPath({ kind: lookupPath, id: text });
    try {
      const response: AxiosResponse<ChildLookupDTO> = await http.get(lookupURL);
      setValue({
        id: response.data.id,
        slug: response.data.slug,
        title: response.data.title,
        deleted: false,
      });
    } catch (e) {
      if (e instanceof AxiosError && e.response != null && e.response.status == 404) {
        toast(`${label} does not exist`, {
          type: "error",
        });
      }
    } finally {
      setSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [searching, text]);

  const onChildClear = useCallback(() => {
    setValue(null);
  }, [setValue]);

  if (!value.id) {
    return (
      <div className="flex mr-4">
        <CommonEditorInputSubtle
          className="flex-auto"
          value={text}
          onChange={onTextChange}
          placeholder="id or slug"
        />
        <CommonEditorActionButton size="bx-sm" icon="bx-search" onClick={onChildSearch} />
      </div>
    );
  } else {
    const url = getPath({ kind: viewPath, slug: value.slug });
    return (
      <div className="flex justify-center align-center mr-4">
        <Link
          className="text-blue-400 hover:text-blue-500 hover:underline"
          target="_blank"
          href={url}
        >
          {value.title}
        </Link>
        <CommonEditorActionButton
          size="bx-sm"
          icon="bx-x"
          onClick={onChildClear}
          className="ml-2"
        />
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
      <CommonEditorTabItem tab={ProblemSetEditorTab.Details} current={tab} label="Details" />
      <CommonEditorTabItem tab={ProblemSetEditorTab.Advanced} current={tab} label="Advanced" />
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

export const ProblemSetEditorAdvanced = ({
  problemSet,
  setProblemSet,
}: ProblemSetEditorAdvancedProps) => {
  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Is Public?" />
        <ProblemSetEditorPublic problemSet={problemSet} setProblemSet={setProblemSet} />
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type ProblemSetEditorPublicProps = {
  problemSet: ProblemSetED;
  setProblemSet(problemSet: ProblemSetED): void;
};
export const ProblemSetEditorPublic = ({
  problemSet,
  setProblemSet,
}: ProblemSetEditorPublicProps) => {
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
        type="checkbox"
        className="border-2 border-gray-250 rounded-md h-6 w-6 self-center"
        checked={problemSet.is_public}
        onChange={onChangePublic}
      />
    </>
  );
};
