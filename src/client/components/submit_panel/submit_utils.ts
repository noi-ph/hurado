import { AxiosError, AxiosResponse } from "axios";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { UnreachableCheck, UnreachableError } from "common/errors";
import { ResponseKind } from "common/responses";
import { TaskViewerOutputDTO } from "common/types";
import { Language, TaskFlavor } from "common/types/constants";
import { SubmissionRequestDTO } from "common/validation/submission_validation";
import http from "client/http";
import { APIPath, getAPIPath, getPath, Path } from "client/paths";
import { SubmissionsCache } from "client/submissions";
import { CreateSubmissionResponse, CreateSubmissionSuccess } from "@root/api/v1/submissions/route";
import type { SubtaskState } from "./submit_output";

export function createSubmissionOutput(
  task: TaskViewerOutputDTO,
  subtasks: SubtaskState[]
): FormData {
  const data = new FormData();
  const request: SubmissionRequestDTO = {
    task_id: task.id,
    language: Language.PlainText,
  };

  const blobRequest = new Blob([JSON.stringify(request)], { type: "application/json" });
  data.set("request", blobRequest);

  for (let i = 0; i < task.subtasks.length; i++) {
    // Task-provided file names are prepended with $ to not collide with internal stuff
    const filename = "$" + task.subtasks[i].file_name;

    let blob: Blob | null = null;
    if (task.flavor === TaskFlavor.OutputText) {
      const text = subtasks[i].text;
      if (text.trim() != "") {
        blob = new Blob([text]);
      }
    } else if (task.flavor === TaskFlavor.OutputFile) {
      blob = subtasks[i].file;
    } else {
      throw new UnreachableError(task.flavor);
    }

    if (blob != null) {
      data.set(filename, blob);
    }
  }

  return data;
}

export function createSubmissionCode(taskId: string, language: Language, code: string): FormData {
  const data = new FormData();
  const request: SubmissionRequestDTO = {
    task_id: taskId,
    language: language,
  };

  const blobRequest = new Blob([JSON.stringify(request)], { type: "application/json" });
  data.set("request", blobRequest);

  const blobSource = new Blob([code], { type: "text/plain" });
  data.set("source", blobSource);
  return data;
}

export async function postSubmission(
  data: FormData,
  submissions: SubmissionsCache | null,
  router: AppRouterInstance
): Promise<void> {
  try {
    const submissionCreateURL = getAPIPath({ kind: APIPath.SubmissionCreate });
    const response: AxiosResponse<CreateSubmissionSuccess> = await http.post(
      submissionCreateURL,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (submissions) {
      submissions.clear();
    }
    router.refresh();
    router.push(getPath({ kind: Path.Submission, uuid: response.data.data.id }));
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      const response: AxiosResponse<Exclude<CreateSubmissionResponse, CreateSubmissionSuccess>> =
        e.response;
      const data = response.data;
      switch (data.kind) {
        case ResponseKind.ForbiddenError:
          toast.error("You are not allowed to submit to this task");
          break;
        case ResponseKind.ValidationError:
          // Iterate over the errors and display them
          for (const key in data.errors) {
            // eslint-disable-next-line no-prototype-builtins -- pre-existing error before eslint inclusion
            if (data.errors.hasOwnProperty(key)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
              const errorMessages = (data.errors as any)[key];
              errorMessages.forEach((message: string) => {
                toast.error(message);
              });
            }
          }
          if (data.errors.language) {
            toast.error("Invalid language");
          }
          break;
        default:
          UnreachableCheck(data);
          toast.error("An unexpected error occurred");
          console.log(e);
      }
    } else {
      toast.error("An network error occurred. Please try again.");
      throw e;
    }
  }
}

export async function rejudgeSubmission(
  submission_id: string,
  submissions: SubmissionsCache | null,
  router: AppRouterInstance
) {
  try {
    const submissionRejudgeURL = getAPIPath({ kind: APIPath.SubmissionRejudge, id: submission_id });
    await http.put(submissionRejudgeURL);
    if (submissions) {
      submissions.clear();
    }
    router.refresh();
    location.reload(); // force the page to re-load itself
  } catch (e) {
    if (e instanceof AxiosError && e.response) {
      toast.error("An unexpected error occurred in rejudging the submission");
      console.log(e.response);
    } else {
      toast.error("An network error occurred. Please try again.");
      throw e;
    }
    return null;
  }
}
