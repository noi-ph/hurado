import { NextRequest, NextResponse } from "next/server";
import { zSubmissionRequest } from "common/validation/submission_validation";
import { createSubmission } from "server/logic/submissions/create_submission";
import { getSession } from "server/sessions";
import { enqueueSubmissionJudgement } from "worker/queue";

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (session == null) {
    return NextResponse.json({}, { status: 401 });
  }

  const formData = await request.formData();
  const formRequest = formData.get("request") as File;
  const formSource = formData.get("source") as File;
  if (!(formRequest instanceof File)) {
    return NextResponse.json(
      {
        error: "Missing File: request",
      },
      { status: 400 }
    );
  } else if (!(formSource instanceof File)) {
    return NextResponse.json(
      {
        error: "Missing File: source",
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

  const submission = await createSubmission(formSource, zodRequest.data, session.user);

  enqueueSubmissionJudgement({
    id: submission.id,
  });

  return NextResponse.json(submission);
}
