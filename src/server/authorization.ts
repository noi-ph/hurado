import { NextRequest } from "next/server";
import { SessionData } from "common/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { KOMPGEN_SECRET } from "./secrets";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
export function canManageTasks(
  session: SessionData | null,
  request: NextRequest | undefined = undefined
): boolean {
  if (session == null || session.user.role != "admin") {
    return false;
  }
  return true;
}

export function canManageProblemSets(session: SessionData | null): boolean {
  if (session == null || session.user.role != "admin") {
    return false;
  }
  return true;
}

export function canManageContests(session: SessionData | null): boolean {
  if (session == null || session.user.role != "admin") {
    return false;
  }
  return true;
}
