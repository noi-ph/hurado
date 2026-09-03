import { AxiosResponse } from "axios";
import http from "client/http";
import {
  ProblemSetEditorDTO,
  ProblemSetUpdateDTO,
  ProblemSetTaskUpdateDTO,
  ProblemSetNestedUpdateDTO,
} from "common/validation/problem_set_validation";
import { APIPath, getAPIPath } from "client/paths";
import { SaveResult } from "client/components/common_editor";
import { coerceProblemSetED } from "./problem_set_coercion";
import { ProblemSetED, ProblemSetChildED } from "./types";

export async function saveProblemSet(
  origSet: ProblemSetED,
  set: ProblemSetED
): Promise<SaveResult<ProblemSetED>> {
  const errors = validateProblemSet(origSet, set);
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const dto = coerceProblemSetUpdateDTO(set);
  const setUpdateURL = getAPIPath({ kind: APIPath.ProblemSetUpdate, id: set.id });
  const response: AxiosResponse<ProblemSetEditorDTO> = await http.put(setUpdateURL, dto);
  return {
    success: true,
    value: coerceProblemSetED(response.data),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
function validateProblemSet(origSet: ProblemSetED, set: ProblemSetED): string[] {
  if (origSet.slug === "root" && origSet.slug !== set.slug) {
    return ["Cannot change the slug of root"];
  }
  return [];
}

function coerceProblemSetUpdateDTO(ed: ProblemSetED): ProblemSetUpdateDTO {
  function isGoodChild(child: ProblemSetChildED): boolean {
    return !child.deleted && !!child.id;
  }

  return {
    id: ed.id,
    slug: ed.slug,
    title: ed.title,
    description: ed.description,
    is_public: ed.is_public,
    order: ed.order,
    tasks: ed.tasks.filter(isGoodChild).map(coerceProblemSetTaskDTO),
    nesteds: ed.nesteds.filter(isGoodChild).map(coerceProblemSetNestedDTO),
  };
}

function coerceProblemSetTaskDTO(ed: ProblemSetChildED, index: number): ProblemSetTaskUpdateDTO {
  return {
    task_id: ed.id,
    order: index,
  };
}

function coerceProblemSetNestedDTO(
  ed: ProblemSetChildED,
  index: number
): ProblemSetNestedUpdateDTO {
  return {
    child_id: ed.id,
    order: index,
  };
}
