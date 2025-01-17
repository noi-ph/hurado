import { z } from "zod";
import { zCheckerKind, zLanguageKind, zReducerKind, zTaskFlavorOutput } from "./constant_validation";
import { CheckerKind, TaskType } from "common/types/constants";
import { REGEX_SLUG } from "./common_validation";
import { memo } from "react";

export type TaskCreditDTO = z.infer<typeof zTaskCredit>;
export type TaskAttachmentDTO = z.infer<typeof zTaskAttachment>;
export type TaskScriptDTO = z.infer<typeof zTaskScript>;
export type TaskSampleIO_DTO = z.infer<typeof zTaskSampleIO>;

export type TaskBatchDTO = z.infer<typeof zTaskTypeBatch>;
export type TaskSubtaskBatchDTO = z.infer<typeof zTaskSubtaskBatch>;
export type TaskDataBatchDTO = z.infer<typeof zTaskDataBatch>;

export type TaskOutputDTO = z.infer<typeof zTaskTypeOutput>;
export type TaskSubtaskOutputDTO = z.infer<typeof zTaskSubtaskOutput>;
export type TaskDataOutputDTO = z.infer<typeof zTaskDataOutput>;

export type TaskCommunicationDTO = z.infer<typeof zTaskTypeCommunication>;
export type TaskSubtaskCommunicationDTO = z.infer<typeof zTaskSubtaskCommunication>;
export type TaskDataCommunicationDTO = z.infer<typeof zTaskDataCommunication>;

export type TaskDTO = TaskBatchDTO | TaskOutputDTO | TaskCommunicationDTO;
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

const zTaskSampleIO = z.object({
  id: z.string().uuid().optional(),
  input: z.string(),
  output: z.string(),
  explanation: z.string(),
});

const zTaskScript = z.object({
  id: z.string().uuid().optional(),
  file_name: z.string().min(1),
  file_hash: z.string().min(1),
  language: zLanguageKind,
  argv: z.array(z.string()).optional(),
});

const zTaskCommon = {
  id: z.string().uuid(),
  slug: z.string().min(1).regex(REGEX_SLUG, "Must be alphanumeric or dashes"),
  title: z.string().min(1),
  description: z.string().nullable(),
  statement: z.string(),
  is_public: z.boolean(),
  score_max: z.number().nonnegative(),
  credits: z.array(zTaskCredit),
  attachments: z.array(zTaskAttachment),
  scripts: z.array(zTaskScript),
  sample_IO: z.array(zTaskSampleIO),
};

const zTaskDataBatch = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  input_file_hash: z.string().min(1),
  input_file_name: z.string().min(1),
  judge_file_hash: z.string().min(1),
  judge_file_name: z.string().min(1),
});

export const zTaskSubtaskBatch = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  score_max: z.number().nonnegative(),
  data: z.array(zTaskDataBatch),
  reducer_kind: zReducerKind.optional(),
  reducer_script: zTaskScript.optional(),
});

export const zTaskTypeBatch = z.object({
  ...zTaskCommon,
  type: z.literal(TaskType.Batch),
  time_limit_ms: z.number().nonnegative().nullable(),
  memory_limit_byte: z.number().nonnegative().nullable(),
  compile_time_limit_ms: z.number().nonnegative().nullable(),
  compile_memory_limit_byte: z.number().nonnegative().nullable(),
  submission_size_limit_byte: z.number().nonnegative().nullable(),
  checker_kind: zCheckerKind,
  checker_file_name: z.string().optional(),
  subtasks: z.array(zTaskSubtaskBatch),
});

const zTaskDataOutput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  judge_file_hash: z.string().min(1),
  judge_file_name: z.string().min(1),
});

export const zTaskSubtaskOutput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  score_max: z.number().nonnegative(),
  data: z.array(zTaskDataOutput).length(1),
});

export const zTaskTypeOutput = z.object({
  ...zTaskCommon,
  type: z.literal(TaskType.OutputOnly),
  flavor: zTaskFlavorOutput,
  time_limit_ms: z.null(),
  memory_limit_byte: z.null(),
  compile_time_limit_ms: z.null(),
  compile_memory_limit_byte: z.null(),
  submission_size_limit_byte: z.number().nonnegative().nullable(),
  checker_kind: zCheckerKind,
  checker_file_name: z.string().optional(),
  subtasks: z.array(zTaskSubtaskOutput),
});

const zTaskDataCommunication = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  input_file_hash: z.string().min(1),
  input_file_name: z.string().min(1),
  judge_file_hash: z.string().min(1),
  judge_file_name: z.string().min(1),
});

export const zTaskSubtaskCommunication = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  score_max: z.number().nonnegative(),
  data: z.array(zTaskDataCommunication),
  reducer_kind: zReducerKind.optional(),
  reducer_script: zTaskScript.optional(),
});

export const zTaskTypeCommunication = z.object({
  ...zTaskCommon,
  type: z.literal(TaskType.Communication),
  time_limit_ms: z.number().nonnegative().nullable(),
  memory_limit_byte: z.number().nonnegative().nullable(),
  compile_time_limit_ms: z.number().nonnegative().nullable(),
  compile_memory_limit_byte: z.number().nonnegative().nullable(),
  submission_size_limit_byte: z.number().nonnegative().nullable(),
  checker_kind: zCheckerKind,
  checker_file_name: z.string().optional(),
  communicator_file_name: z.string().min(1),
  subtasks: z.array(zTaskSubtaskCommunication),
});

export const zTask = z
  .discriminatedUnion("type", [zTaskTypeBatch, zTaskTypeOutput, zTaskTypeCommunication])
  .superRefine((obj, ctx) => {
    if (obj.checker_kind === CheckerKind.Custom) {
      if (obj.checker_file_name == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checker_script"],
          message: "Checker script cannot be null if using a custom checker",
        });
      }
    } else {
      if (obj.checker_file_name != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["checker_script"],
          message: "Checker script must be null if using a default checker",
        });
      }
    }
  });

export const zTaskCreateSimple = z.object({
  slug: zTaskCommon.slug,
  title: zTaskCommon.title,
});
