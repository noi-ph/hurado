import { CommonAttachmentED } from "../common_editor/types";

export type ContestED = {
  id: string;
  slug: string;
  title: string;
  description: string;
  statement: string;
  start_time: Date | null;
  end_time: Date | null;
  attachments: CommonAttachmentED[];
  tasks: ContestTaskED[];
  is_public: boolean;
};

export type ContestTaskED = {
  task: ContestTaskTaskED | null;
  score_max: number;
  letter: string;
  deleted: boolean;
};

export type ContestTaskTaskED = {
  id: string;
  slug: string;
  title: string;
};
