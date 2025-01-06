export type ProblemSetED = {
  id: string;
  slug: string;
  title: string;
  description: string;
  is_public: boolean;
  order: number;
  tasks: ProblemSetTaskED[];
};

export type ProblemSetTaskED = {
  id: string;
  slug: string;
  title: string;
  deleted: boolean;
};
