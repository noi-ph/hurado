import {
  ProblemSetEditorDTO,
  ProblemSetNestedEditorDTO,
  ProblemSetTaskEditorDTO,
} from "common/validation/problem_set_validation";
import { ProblemSetED, ProblemSetChildED } from "./types";

export function coerceProblemSetED(dto: ProblemSetEditorDTO): ProblemSetED {
  const set: ProblemSetED = {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description ?? "",
    is_public: dto.is_public,
    order: dto.order,
    tasks: dto.tasks.map((x) => coerceProblemSetTaskED(x)),
    nesteds: dto.nesteds.map((x) => coerceProblemSetNestedED(x)),
  };
  return set;
}

function coerceProblemSetTaskED(dto: ProblemSetTaskEditorDTO): ProblemSetChildED {
  return {
    id: dto.task_id,
    slug: dto.slug,
    title: dto.title,
    deleted: false,
  };
}

function coerceProblemSetNestedED(dto: ProblemSetNestedEditorDTO): ProblemSetChildED {
  return {
    id: dto.child_id,
    slug: dto.slug,
    title: dto.title,
    deleted: false,
  };
}
