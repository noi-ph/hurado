import { NextRequest, NextResponse } from "next/server";
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
import { z } from "zod";
import { NextContext } from "types/nextjs";
import { upsertOverallVerdict } from "server/logic/judgements/judge_runner";
import { loadSubmission, loadTask } from "server/logic/submissions/judge_submission";

type RouteParams = {
  id: string;
};

export async function PUT(request: NextRequest, context: NextContext<RouteParams>) {
  const session = await getSession(request);
  if (session == null) {
    return NextResponse.json(APIForbiddenError, { status: 401 });
  }
  if (!canManageTasks(session, request)) {
    return NextResponse.json({}, { status: 403 });
  }

  const [submission, task] = await db.transaction().execute(async (trx) => {
    const sub = await loadSubmission(trx, context.params.id);
    const tsk = await loadTask(trx, sub.task_id);
    
    await trx
      .updateTable("submissions")
      .where("submissions.id", "=", sub.id)
      .set({
        official_verdict_id: null,
      })
      .execute();

    await trx
      .updateTable("verdicts")
      .set({
        is_official: false,
      })
      .where("verdicts.id", "=", sub.official_verdict_id)
      .execute();
    return [sub, tsk];
  });
  upsertOverallVerdict(task, submission.user_id, submission.contest_id);
  enqueueSubmissionJudgement({ id: context.params.id });

  return NextResponse.json(null);
}
