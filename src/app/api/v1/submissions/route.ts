import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "db";
import {
  APIForbiddenError,
  APIForbiddenErrorType,
  APISuccessResponse,
  APIValidationErrorCustomType,
  customValidationError,
  makeSuccessResponse,
  zodValidationError,
} from "common/responses";
import { SubmissionSummaryDTO } from "common/types";
import { Language, TaskType } from "common/types/constants";
import { SubmissionRequestDTO, zSubmissionRequest } from "common/validation/submission_validation";
import { canManageTasks } from "server/authorization";
import { LIMITS_DEFAULT_SUBMISSION_SIZE_LIMIT_BYTE } from "server/evaluation/judge_constants";
import { createSubmission, SubmissionFileCreate } from "server/logic/submissions/create_submission";
import { getSession } from "server/sessions";
import { enqueueSubmissionJudgement } from "worker/queue";

type CreateSubmissionValidationErrors = {
  request: true;
  file_size: true;
} & z.infer<typeof zSubmissionRequest>;

export type CreateSubmissionError = APIValidationErrorCustomType<CreateSubmissionValidationErrors>;
export type CreateSubmissionSuccess = APISuccessResponse<SubmissionSummaryDTO>;

export type CreateSubmissionResponse =
  | APIForbiddenErrorType
  | CreateSubmissionError
  | CreateSubmissionSuccess;

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (session == null) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }

  const formData = await request.formData();
  const formRequest = formData.get("request") as File;
  if (!(formRequest instanceof File)) {
    return NextResponse.json(
      customValidationError<CreateSubmissionValidationErrors>({
        request: ["Missing File: Request"],
      }),
      { status: 400 }
    );
  }

  const jsonRequest = JSON.parse(await formRequest.text());
  const zodRequest = zSubmissionRequest.safeParse(jsonRequest);
  if (!zodRequest.success) {
    const errors = zodValidationError(zodRequest.error);
    return NextResponse.json(errors, { status: 400 });
  }

  const submissionReq: SubmissionRequestDTO = zodRequest.data;

  const task = await db
    .selectFrom("tasks")
    .select(["type", "allowed_languages", "submission_size_limit_byte", "is_public"])
    .where("id", "=", submissionReq.task_id)
    .executeTakeFirst();

  if (task == null) {
    return NextResponse.json(
      customValidationError<CreateSubmissionValidationErrors>({
        task_id: ["Invalid task"],
      }),
      { status: 400 }
    );
  } else if (!task.is_public && !canManageTasks(session)) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }

  if (!isAllowedLanguage(task.type, task.allowed_languages, submissionReq.language)) {
    return NextResponse.json(
      customValidationError<CreateSubmissionValidationErrors>({
        language: ["Invalid language"],
      }),
      { status: 400 }
    );
  }

  let sources: SubmissionFileCreate[];

  if (task.type === TaskType.OutputOnly) {
    const allowedFileNameList = await loadAllowedFilenames(submissionReq.task_id);
    const allowedFileNames = new Set(allowedFileNameList);

    sources = [];
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("$")) {
        // Task-provided file names are prepended with $ to not collide with internal stuff
        // This skips through 'request' and any other weird user-hacked stuff
        continue;
      } else if (!(value instanceof File)) {
        continue;
      }

      // Remove the pre-pended "$"
      const filename = key.substring(1);
      if (!allowedFileNames.has(filename)) {
        continue;
      }

      sources.push({
        file: value,
        filename: filename,
      });
    }
  } else {
    const formSource = formData.get("source");
    if (!(formSource instanceof File)) {
      return NextResponse.json(
        customValidationError<CreateSubmissionValidationErrors>({
          request: ["Missing File: Source"],
        }),
        { status: 400 }
      );
    }
    sources = [
      {
        file: formSource,
        filename: null,
      },
    ];
  }

  if (!areAllowedFileSizes(sources, task.submission_size_limit_byte)) {
    return NextResponse.json(
      customValidationError<CreateSubmissionValidationErrors>({
        file_size: ["Submission files are too big"],
      }),
      { status: 400 }
    );
  }

  const submission = await createSubmission(sources, submissionReq, session.user);

  enqueueSubmissionJudgement({
    id: submission.id,
  });

  return NextResponse.json(makeSuccessResponse<SubmissionSummaryDTO>(submission));
}

function isAllowedLanguage(type: TaskType, allowed: Language[] | null, language: Language) {
  if (type === TaskType.OutputOnly) {
    return language === Language.PlainText;
  }

  return allowed == null || allowed.includes(language);
}

function areAllowedFileSizes(files: SubmissionFileCreate[], size_limit: number | null) {
  const limit = size_limit || LIMITS_DEFAULT_SUBMISSION_SIZE_LIMIT_BYTE;
  return files.every((f) => f.file.size <= limit);
}

async function loadAllowedFilenames(taskId: string): Promise<string[]> {
  const data = await db
    .selectFrom("task_subtasks")
    .innerJoin("task_data", "task_data.subtask_id", "task_subtasks.id")
    .orderBy(["task_subtasks.order", "task_data.order"])
    .where("task_subtasks.task_id", "=", taskId)
    .select("task_data.judge_file_name")
    .execute();

  return data.map((d) => d.judge_file_name);
}
