import { RefinementCtx, z } from "zod";
import { zCheckerKind, zLanguageKind, zScorerKind, zTaskFlavorOutput } from "./constant_validation";
import { CheckerKind, TaskType } from "common/types/constants";

export type TaskCreditDTO = z.infer<typeof zTaskCredit>;
export type TaskAttachmentDTO = z.infer<typeof zTaskAttachment>;
export type TaskScriptDTO = z.infer<typeof zTaskScript>;

export type TaskBatchDTO = z.infer<typeof zTaskTypeBatch>;
export type TaskSubtaskBatchDTO = z.infer<typeof zTaskSubtaskBatch>;
export type TaskDataBatchDTO = z.infer<typeof zTaskDataBatch>;

export type TaskOutputDTO = z.infer<typeof zTaskTypeOutput>;
export type TaskSubtaskOutputDTO = z.infer<typeof zTaskSubtaskOutput>;
export type TaskDataOutputDTO = z.infer<typeof zTaskDataOutput>;

export type TaskDTO = TaskBatchDTO | TaskOutputDTO;
export type TaskSubtaskDTO = TaskSubtaskBatchDTO | TaskSubtaskOutputDTO;
export type TaskDataDTO = TaskDataBatchDTO | TaskDataOutputDTO;

const zTaskCredit = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  role: z.string().min(1),
});

const zTaskAttachment = z.object({
  id: z.string().uuid().optional(),
  path: z.string().min(1),
  mime_type: z.string(),
  file_hash: z.string().min(1),
});

const zTaskScript = z.object({
  id: z.string().uuid().optional(),
  file_name: z.string().min(1),
  file_hash: z.string().min(1),
  language: zLanguageKind,
  argv: z.array(z.string()),
});

const zTaskCommon = {
  id: z.string().uuid(),
  slug: z.string().min(1).regex(SLUG_REGEX),
  title: z.string().min(1),
  description: z.string().nullable(),
  statement: z.string(),
  is_public: z.boolean(),
  score_max: z.number().nonnegative(),
  credits: z.array(zTaskCredit),
  attachments: z.array(zTaskAttachment),
};

const zTaskDataBatch = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  is_sample: z.boolean(),
  input_file_hash: z.string().min(1),
  input_file_name: z.string().min(1),
  output_file_hash: z.string().min(1),
  output_file_name: z.string().min(1),
  judge_file_hash: z.string().nullable(),
  judge_file_name: z.string().nullable(),
});

const zTaskSubtaskBatch = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  score_max: z.number().nonnegative(),
  data: z.array(zTaskDataBatch),
  scorer_kind: zScorerKind.optional(),
  scorer_script: zTaskScript.optional(),
});

export const zTaskTypeBatch = z.object({
  ...zTaskCommon,
  type: z.literal(TaskType.Batch),
  time_limit_ms: z.number().nonnegative(),
  memory_limit_byte: z.number().nonnegative(),
  compile_time_limit_ms: z.number().nonnegative().nullable(),
  compile_memory_limit_byte: z.number().nonnegative().nullable(),
  submission_size_limit_byte: z.number().nonnegative().nullable(),
  checker_kind: zCheckerKind,
  checker_script: zTaskScript.optional(),
  subtasks: z.array(zTaskSubtaskBatch),
});

const zTaskDataOutput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  output_file_hash: z.string().min(1),
  output_file_name: z.string().min(1),
  judge_file_hash: z.string().nullable(),
  judge_file_name: z.string().nullable(),
});

const zTaskSubtaskOutput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  score_max: z.number().nonnegative(),
  data: z.array(zTaskDataOutput).length(1),
});

export const zTaskTypeOutput = z.object({
  ...zTaskCommon,
  type: z.literal(TaskType.OutputOnly),
  flavor: zTaskFlavorOutput,
  submission_size_limit_byte: z.number().nonnegative().nullable(),
  checker_kind: zCheckerKind,
  checker_script: zTaskScript.optional(),
  subtasks: z.array(zTaskSubtaskOutput),
});

export const zTaskSchema = z
  .discriminatedUnion("type", [zTaskTypeBatch, zTaskTypeOutput])
  .superRefine((obj, ctx) => {
    const subtasks = obj.subtasks as TaskSubtaskDTO[];
    if (obj.checker_kind === CheckerKind.Custom) {
      if (obj.checker_script == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checker_script"],
          message: "Checker script cannot be null if using a custom checker",
        });
      }
      forEachTaskData(subtasks, (_subtask, data, path) => {
        validateDataJudgeNullity(ctx, data, path);
      });
    } else {
      if (obj.checker_script != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checker_script"],
          message: "Checker script must be null if using a default checker",
        });
      }
      forEachTaskData(subtasks, (_subtask, data, path) => {
        validateDataHasNoJudge(ctx, data, path);
      });
    }
  });

function validateDataHasNoJudge(ctx: RefinementCtx, data: TaskDataDTO, path: string[]) {
  if (data.judge_file_name != null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...path, "judge_file_name"],
      message: "judge_file_name must be null if using a default checker",
    });
  }
  if (data.judge_file_hash != null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...path, "judge_file_hash"],
      message: "judge_file_hash must be null if using a default checker",
    });
  }
}

function validateDataJudgeNullity(ctx: RefinementCtx, data: TaskDataDTO, path: string[]) {
  const judge_file_name_nullity = data.judge_file_name == null;
  const judge_file_hash_nullity = data.judge_file_hash == null;
  if (judge_file_name_nullity != judge_file_hash_nullity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...path, "judge_file_path"],
      message: "judge_file_path must be null if judge_file_name is null",
    });
  }
}

function forEachTaskData(
  subtasks: TaskSubtaskDTO[],
  callback: (
    subtask: TaskSubtaskDTO,
    data: TaskDataDTO,
    path: string[],
    subtaskIndex: string,
    dataIndex: string
  ) => void
) {
  for (let subtaskIndex in subtasks) {
    const subtask = subtasks[subtaskIndex];
    for (let dataIndex in subtask.data) {
      const data = subtask.data[dataIndex];
      const path = ["subtasks", subtaskIndex, "data", dataIndex];
      callback(subtask, data, path, subtaskIndex, dataIndex);
    }
  }
}
