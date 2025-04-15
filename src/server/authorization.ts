import { SessionData } from "common/types";

export function canManageTasks(session: SessionData | null): boolean {
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

export function canManageUser(session: SessionData | null, id: string): boolean {
  if (session == null) {
    return false;
  } else if (session.user.role == "admin") {
    return true;
  } else {
    return session.user.id == id;
  }
}
