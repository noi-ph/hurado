export type ProblemSetED = {
  id: string;
  slug: string;
  title: string;
  description: string;
  is_public: boolean;
  order: number;
  tasks: ProblemSetChildED[];
  nesteds: ProblemSetChildED[];
};

export type ProblemSetChildED = {
  id: string;
  slug: string;
  title: string;
  deleted: boolean;
};
