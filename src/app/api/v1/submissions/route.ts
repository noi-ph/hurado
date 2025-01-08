import { NextRequest, NextResponse } from "next/server";
import { SubmissionRequestDTO, zSubmissionRequest } from "common/validation/submission_validation";
import { createSubmission, SubmissionFileCreate } from "server/logic/submissions/create_submission";
import { getSession } from "server/sessions";
import { enqueueSubmissionJudgement } from "worker/queue";
import { db } from "db";
import { Language, TaskType } from "common/types/constants";
import { SubmissionFileStorage } from "server/files";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }

  const formData = await request.formData();
  const formRequest = formData.get("request") as File;
  if (!(formRequest instanceof File)) {
    return NextResponse.json(
      {
        error: "Missing File: request",
      },
      { status: 400 }
    );
  }
  const jsonRequest = JSON.parse(await formRequest.text());
  const zodRequest = zSubmissionRequest.safeParse(jsonRequest);
  if (!zodRequest.success) {
    return NextResponse.json(
      {
        error: zodRequest.error,
      },
      { status: 400 }
    );
  }
  const submissionReq: SubmissionRequestDTO = zodRequest.data;

  const task = await db
    .selectFrom("tasks")
    .select(["type", "allowed_languages"])
    .where("id", "=", submissionReq.task_id)
    .executeTakeFirst();

  if (task == null) {
    return NextResponse.json(
      {
        error: "Invalid task",
      },
      { status: 400 }
    );
  }

  if (!isAllowedLanguage(task.type, task.allowed_languages, submissionReq.language)) {
    return NextResponse.json(
      {
        error: "Invalid language",
      },
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

    // load the old submission as well
    const recentSubmissionFilesDb = await db
      .selectFrom(
        (qb) => qb
          .selectFrom('submissions')
          .where('task_id', '=', submissionReq.task_id)
          .where('user_id', '=', session.user.id)
          .orderBy('created_at', 'desc')
          .select(['id'])
          .limit(1)
          .as('previousSubmission')
      )
      .innerJoin('submission_files', 'submission_files.submission_id', 'previousSubmission.id')
      .innerJoin(
        (eb) =>
          eb
            .selectFrom("tasks")
            .where("tasks.id", "=", submissionReq.task_id)
            .innerJoin("task_subtasks", "task_subtasks.task_id", "tasks.id")
            .innerJoin("task_data", "task_data.subtask_id", "task_subtasks.id")
            .select(["task_data.judge_file_name", "task_subtasks.order as subtask_order"])
            .as("task_info"),
        (join) => join.onRef("task_info.judge_file_name", "=", "submission_files.file_name")
      )
      .select(["submission_files.hash", "task_info.subtask_order"])
      .execute();

    for (const { hash, subtask_order } of recentSubmissionFilesDb) {
      const filename = allowedFileNameList.at(subtask_order-1);
      if (filename == undefined) {
        continue;
      }
      if (sources.some((source) => source.filename === filename)) {
        continue;
      }

      let buffer: Buffer | null;
      try {
        buffer = await SubmissionFileStorage.downloadToBuffer(hash);
      } catch {
        buffer = null;
      }

      if (buffer == null) {
        continue;
      }

      const file = new File([buffer], filename, { type: "application/octet-stream" });
      sources.push({
        file,
        filename,
      });
    }
    
  } else {
    const formSource = formData.get("source");
    if (!(formSource instanceof File)) {
      return NextResponse.json(
        {
          error: "Missing File: source",
        },
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

  const submission = await createSubmission(sources, submissionReq, session.user);

  enqueueSubmissionJudgement({
    id: submission.id,
  });

  return NextResponse.json(submission);
}

function isAllowedLanguage(type: TaskType, allowed: Language[] | null, language: Language) {
  if (type === TaskType.OutputOnly) {
    return language === Language.PlainText;
  }

  return allowed == null || allowed.includes(language);
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
