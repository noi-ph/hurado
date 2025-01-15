import { useCallback } from "react";
import { CommonEditorContent, CommonEditorDetails, CommonEditorLabel } from "../common_editor";
import { ContestED } from "./types";
import { InputChangeEvent } from "common/types/events";

type ContestEditorAdvancedProps = {
  contest: ContestED;
  setContest(contest: ContestED): void;
};

export const ContestEditorAdvanced = ({ contest, setContest }: ContestEditorAdvancedProps) => {
  return (
    <CommonEditorContent>
      <CommonEditorDetails>
        <CommonEditorLabel label="Is Public?" />
        <ContestEditorPublic contest={contest} setContest={setContest}/>
      </CommonEditorDetails>
    </CommonEditorContent>
  );
};

type ContestEditorPublicProps = {
  contest: ContestED;
  setContest(contest: ContestED): void;
}
export const ContestEditorPublic = ({ contest, setContest }: ContestEditorPublicProps) => {
  const onChangePublic = useCallback(
    (event: InputChangeEvent) => {
      setContest({
        ...contest,
        is_public: event.target.checked,
      });
    },
    [contest, setContest]
  );
  return (
    <>
      <input
        type='checkbox'
        className="border-2 border-gray-250 rounded-md h-6 w-6 self-center"
        checked={contest.is_public}
        onChange={onChangePublic}
      />
    </>
  );
}