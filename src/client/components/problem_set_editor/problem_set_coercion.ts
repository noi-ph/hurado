import {
  ProblemSetEditorDTO,
  ProblemSetTaskEditorDTO,
} from "common/validation/problem_set_validation";
import { ProblemSetED, ProblemSetTaskED } from "./types";

export function coerceProblemSetED(dto: ProblemSetEditorDTO): ProblemSetED {
  const set: ProblemSetED = {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description ?? "",
    is_public: dto.is_public,
    order: dto.order,
    tasks: dto.tasks.map((x) => coerceProblemSetTaskED(x)),
  };
  return set;
}

function coerceProblemSetTaskED(dto: ProblemSetTaskEditorDTO): ProblemSetTaskED {
  return {
    id: dto.task_id,
    slug: dto.slug,
    title: dto.title,  
    order: dto.order,
  };
}
