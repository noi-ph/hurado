import { AxiosResponse } from "axios";
import http from "client/http";
import {
  ProblemSetEditorDTO,
  ProblemSetUpdateDTO,
  ProblemSetTaskUpdateDTO,
} from "common/validation/problem_set_validation";
import { APIPath, getAPIPath } from "client/paths";
import { SaveResult } from "client/components/common_editor";
import { coerceProblemSetED } from "./problem_set_coercion";
import { ProblemSetED, ProblemSetTaskED } from "./types";

export async function saveProblemSet(set: ProblemSetED): Promise<SaveResult<ProblemSetED>> {
  const errors = validateProblemSet(set);
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
function validateProblemSet(set: ProblemSetED): string[] {
  return [];
}

function coerceProblemSetUpdateDTO(ed: ProblemSetED): ProblemSetUpdateDTO {
  function isGoodTask(task: ProblemSetTaskED): boolean {
    return !task.deleted && !!task.id;
  }

  return {
    id: ed.id,
    slug: ed.slug,
    title: ed.title,
    description: ed.description,
    is_public: ed.is_public,
    order: ed.order,
    tasks: ed.tasks.filter(isGoodTask).map(coerceProblemSetTaskDTO),
  };
}

function coerceProblemSetTaskDTO(ed: ProblemSetTaskED, index: number): ProblemSetTaskUpdateDTO {
  return {
    task_id: ed.id,
    order: index,
  };
}
