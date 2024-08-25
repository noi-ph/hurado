import z from 'zod';
import { CheckerKind, Language, ScorerKind, TaskFlavor, TaskType } from 'common/types/constants';


export const zLanguageKind = z.union([
  z.literal(Language.CPP),
  z.literal(Language.Java),
  z.literal(Language.Python3),
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

export const zScorerKind = z.union([
  z.literal(ScorerKind.MinData),
  z.literal(ScorerKind.Custom),
]);
