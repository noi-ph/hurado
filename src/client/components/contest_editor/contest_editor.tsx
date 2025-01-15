"use client";
import { memo, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "client/components/navbar";
import { ContestEditorDTO } from "common/validation/contest_validation";
import {
  CommonEditorFooter,
  CommonEditorTitle,
  CommonEditorStatement,
  getLocationHash,
  CommonEditorTabItem,
  CommonEditorViewLink,
  CommonEditorTabComponent,
  CommonEditorPage,
} from "client/components/common_editor";
import commonStyles from "client/components/common_editor/common_editor.module.css";
import { ContestED } from "./types";
import { saveContest } from "./contest_editor_saving";
import { coerceContestED } from "./contest_coercion";
import { ContestEditorDetails } from "./contest_editor_details";
import { getPath, Path } from "client/paths";
import { ContestEditorAdvanced } from "./contest_editor_advanced";

type ContestEditorProps = {
  dto: ContestEditorDTO;
};

export const ContestEditor = ({ dto }: ContestEditorProps) => {
  const initialContest = useMemo(() => {
    return coerceContestED(dto);
  }, [dto]);
  const [tab, setTab] = useState(coerceContestEditorTab(getLocationHash()));
  const [contest, setContest] = useState<ContestED>(initialContest);
  const [isMounted, setIsMounted] = useState(false);

  // NextJS hack to detect when hash changes and run some code
  // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
  const params = useParams();
  useEffect(() => {
    const currentTab = coerceContestEditorTab(getLocationHash());
    setTab(currentTab);
    setIsMounted(true);
  }, [params]);

  // Hack to skip the hydration error
  if (!isMounted) {
    return null;
  }

  let content: ReactNode = null;
  switch (tab) {
    case ContestEditorTab.Statement:
      content = <ContestEditorStatement contest={contest} setContest={setContest} />;
      break;
    case ContestEditorTab.Details:
      content = <ContestEditorDetails contest={contest} setContest={setContest} />;
      break;
    case ContestEditorTab.Advanced:
      content = <ContestEditorAdvanced contest={contest} setContest={setContest} />;
      break;
    case ContestEditorTab.Participants:
      content = "Nothing here yet";
      break;
    default:
      content = null;
  }

  // Unfortunately, this thing has to make its own header because it needs to put it in the
  // CSS grid in order to handle overflow scrolling properly in the lower-right corner
  // with OverlayScrollbars. Yeah. The code is scuffed. It's the only place in the world
  // that does this!
  return (
    <CommonEditorPage isStatement={tab === ContestEditorTab.Statement}>
      <Navbar className={commonStyles.header} />
      <CommonEditorTitle title={contest.title} slug={contest.slug} />
      <ContestEditorTabComponent tab={tab} slug={contest.slug} />
      {content}
      <CommonEditorFooter
        object={contest}
        setObject={setContest}
        initial={initialContest}
        saveObject={saveContest}
      />
    </CommonEditorPage>
  );
};

type ContestCommonProps = {
  contest: ContestED;
  setContest(contest: ContestED): void;
};

export function ContestEditorStatement({ contest, setContest }: ContestCommonProps) {
  const setStatement = useCallback(
    (statement: string) => {
      setContest({ ...contest, statement });
    },
    [contest, setContest]
  );
  return <CommonEditorStatement statement={contest.statement} setStatement={setStatement} />;
}

export enum ContestEditorTab {
  Statement = "statement",
  Details = "details",
  Participants = "participants",
  Advanced = "advanced",
}

type ContestEditorTabProps = {
  tab: ContestEditorTab;
  slug: string;
};

export const ContestEditorTabComponent = memo(({ tab, slug }: ContestEditorTabProps) => {
  const viewURL = getPath({ kind: Path.ContestView, slug: slug });

  return (
    <CommonEditorTabComponent>
      <CommonEditorTabItem tab={ContestEditorTab.Statement} current={tab} label="Statement" />
      <CommonEditorTabItem tab={ContestEditorTab.Details} current={tab} label="Details" />
      <CommonEditorTabItem tab={ContestEditorTab.Participants} current={tab} label="Participants" />
      <CommonEditorTabItem tab={ContestEditorTab.Advanced} current={tab} label="Advanced" />
      <CommonEditorViewLink slug={slug} label="View" url={viewURL} />
    </CommonEditorTabComponent>
  );
});

export function coerceContestEditorTab(hash: string): ContestEditorTab {
  const split = hash.split("#");
  const real = split.length >= 2 ? split[1] : "";
  switch (real) {
    case ContestEditorTab.Statement:
    case ContestEditorTab.Details:
    case ContestEditorTab.Participants:
    case ContestEditorTab.Advanced:
      return real;
    default:
      return ContestEditorTab.Statement;
  }
}
