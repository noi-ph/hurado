import { Verdict } from "common/types/constants";

export function getVerdictColorClass(verdict: Verdict | null): string | undefined {
  switch (verdict) {
    case Verdict.Accepted:
      return "text-green-500";
    case Verdict.Partial:
      return "text-yellow-900";
    case Verdict.WrongAnswer:
    case Verdict.RuntimeError:
    case Verdict.TimeLimitExceeded:
    case Verdict.MemoryLimitExceeded:
      return "text-red-500";
    case Verdict.Skipped:
      return "text-blue-500";
    default:
      return undefined;
  }
}
