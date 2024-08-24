import { NextRequest, NextResponse } from "next/server";
import { SubmissionRequestDTO, zSubmissionRequest } from "common/validation/submission_validation";
import { createSubmission, SubmissionFileCreate } from "server/logic/submissions/create_submission";
import { getSession } from "server/sessions";
import { enqueueSubmissionJudgement } from "worker/queue";
import { db } from "db";
import { TaskType } from "common/types/constants";

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

  const subreq: SubmissionRequestDTO = zodRequest.data;
  const task = await db
    .selectFrom("tasks")
    .select(["type", "allowed_languages"])
    .where("id", "=", subreq.task_id)
    .executeTakeFirst();

  if (task == null) {
    return NextResponse.json(
      {
        error: "Invalid task",
      },
      { status: 400 }
    );
  }

  let sources: SubmissionFileCreate[];

  if (task.type === TaskType.OutputOnly) {
    sources = [];
    for (const [key, value] of formData.entries()) {
      if (key === "request") {
        continue;
      }
      if (!(value instanceof File)) {
        continue;
      }
      sources.push({
        file: value,
        filename: key,
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

  const submission = await createSubmission(sources, zodRequest.data, session.user);

  enqueueSubmissionJudgement({
    id: submission.id,
  });

  return NextResponse.json(submission);
}
