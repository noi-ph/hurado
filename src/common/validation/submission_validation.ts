import z from "zod";
import { zLanguageKind } from "./constant_validation";

export type SubmissionRequestDTO = z.infer<typeof zSubmissionRequest>;

export const zSubmissionRequest = z.object({
  task_id: z.string(),
  language: zLanguageKind,
});
