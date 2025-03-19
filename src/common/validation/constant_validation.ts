import z from "zod";
import { CheckerKind, Language, ReducerKind, TaskFlavor, TaskType } from "common/types/constants";

export const zLanguageKind = z.union([
  z.literal(Language.CPP),
  z.literal(Language.Java),
  z.literal(Language.Python3),
  z.literal(Language.PyPy3),
  z.literal(Language.PlainText),
]);

export const zTaskType = z.union([
  z.literal(TaskType.Batch),
  z.literal(TaskType.OutputOnly),
  z.literal(TaskType.Communication),
]);

export const zTaskFlavorOutput = z.union([
  z.literal(TaskFlavor.OutputFile),
  z.literal(TaskFlavor.OutputText),
]);

export const zCheckerKind = z.union([
  z.literal(CheckerKind.LenientDiff),
  z.literal(CheckerKind.Custom),
]);

export const zReducerKind = z.union([
  z.literal(ReducerKind.MinData),
  z.literal(ReducerKind.Custom),
]);
