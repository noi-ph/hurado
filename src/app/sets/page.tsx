import { ProblemSetPage } from "./[slug]/page";

export async function ProblemSetListPage() {
  return <ProblemSetPage params={{ slug: "root" }} />;
}

export default ProblemSetListPage;
