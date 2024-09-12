import { SessionData } from "common/types";

export function canManageTasks(session: SessionData | null): boolean {
  if (session == null || session.user.role != 'admin') {
    return false;
  }
  return true;
}

export function canManageContests(session: SessionData | null): boolean {
  if (session == null || session.user.role != 'admin') {
    return false;
  }
  return true;
}
