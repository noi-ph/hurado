import { UnreachableError } from "common/errors";
import { uuidToHuradoID } from "common/utils/uuid";

export enum Path {
  Home = "Home",
  AccountLogin = "AccountLogin",
  AccountLogout = "AccountLogout",
  AccountRegister = "AccountRegister",
  AccountForgotPassword = "AccountForgotPassword",
  AccountPasswordReset = "AccountPasswordReset",
  Submission = "Submission",
  TaskList = "TaskList",
  TaskView = "TaskView",
  TaskEdit = "TaskEdit",
  TaskAttachment = "TaskAttachment",
  ProblemSetList = "ProblemSetList",
  ProblemSetView = "ProblemSetView",
  ProblemSetEdit = "ProblemSetEdit",
  ContestList = "ContestList",
  ContestView = "ContestView",
  ContestEdit = "ContestEdit",
  ContestAttachment = "ContestAttachment",
  AdminHome = "AdminHome",
  AdminTaskList = "AdminTaskList",
  AdminProblemSetList = "AdminProblemSetList",
  AdminContestList = "AdminContestList",
}

export type PathArguments =
  | { kind: Path.Home }
  | { kind: Path.AccountLogin }
  | { kind: Path.AccountLogout }
  | { kind: Path.AccountRegister }
  | { kind: Path.AccountForgotPassword }
  | { kind: Path.AccountPasswordReset, token: string }
  | { kind: Path.Submission; uuid: string }
  | { kind: Path.TaskList }
  | { kind: Path.TaskView; slug: string }
  | { kind: Path.TaskEdit; uuid: string }
  | { kind: Path.TaskAttachment; slug: string; path: string }
  | { kind: Path.ProblemSetList }
  | { kind: Path.ProblemSetView; slug: string }
  | { kind: Path.ProblemSetEdit; uuid: string }
  | { kind: Path.ContestList }
  | { kind: Path.ContestView; slug: string }
  | { kind: Path.ContestEdit; uuid: string }
  | { kind: Path.ContestAttachment; slug: string; path: string }
  | { kind: Path.AdminHome }
  | { kind: Path.AdminTaskList }
  | { kind: Path.AdminProblemSetList }
  | { kind: Path.AdminContestList };

export function getPath(args: PathArguments) {
  switch (args.kind) {
    case Path.Home:
      return "/";
    case Path.AccountLogin:
      return "/login";
    case Path.AccountLogout:
      return "/logout";
    case Path.AccountRegister:
      return "/register";
    case Path.AccountForgotPassword:
      return "forgot-password";
    case Path.AccountPasswordReset:
      return `/password-reset?token=${args.token}`;
    case Path.Submission:
      return `/submissions/${uuidToHuradoID(args.uuid)}`;
    case Path.TaskList:
      return "/tasks";
    case Path.TaskView:
      return `/tasks/${args.slug}`;
    case Path.TaskEdit:
      return `/tasks/${uuidToHuradoID(args.uuid)}/edit`;
    case Path.TaskAttachment:
      return `/tasks/${args.slug}/attachments/${args.path}`;
    case Path.ProblemSetList:
      return "/sets";
    case Path.ProblemSetView:
      return `/sets/${args.slug}`;
    case Path.ProblemSetEdit:
      return `/sets/${uuidToHuradoID(args.uuid)}/edit`;
    case Path.ContestList:
      return "/contests";
    case Path.ContestView:
      return `/contests/${args.slug}`;
    case Path.ContestEdit:
      return `/contests/${uuidToHuradoID(args.uuid)}/edit`;
    case Path.ContestAttachment:
      return `/contests/${args.slug}/attachments/${args.path}`;
    case Path.AdminHome:
      return "/admin";
    case Path.AdminTaskList:
      return "/admin/tasks";
    case Path.AdminProblemSetList:
      return "/admin/sets";
    case Path.AdminContestList:
      return "/admin/contests";
    default:
      throw new UnreachableError(args);
  }
}

export enum APIPath {
  Login = "Login",
  Register = "Register",
  ForgotPassword = "ForgotPassword",
  ResetPassword = "ResetPassword",
  AttachmentFile = "AttachmentFile",
  SubmissionCreate = "SubmissionCreate",
  UserSubmissions = "UserSubmissions",
  FileHashes = "FileHashes",
  FileUpload = "FileUpload",
  TaskCreate = "TaskCreate",
  TaskCreateSimple = "TaskCreateSimple",
  TaskUpdate = "TaskUpdate",
  TaskLookup = "TaskLookup",
  TaskOverallScoreLookup = "TaskOverallScoreLookup",
  TaskSubmissions = "TaskSubmissions",
  ProblemSetCreate = "ProblemSetCreate",
  ProblemSetUpdate = "ProblemSetUpdate",
  ContestCreate = "ContestCreate",
  ContestUpdate = "ContestUpdate",
}

export type APIPathArguments =
  | { kind: APIPath.Login }
  | { kind: APIPath.Register }
  | { kind: APIPath.ForgotPassword }
  | { kind: APIPath.ResetPassword }
  | { kind: APIPath.SubmissionCreate }
  | { kind: APIPath.UserSubmissions; taskId?: string }
  | { kind: APIPath.FileHashes }
  | { kind: APIPath.FileUpload }
  | { kind: APIPath.TaskCreate }
  | { kind: APIPath.TaskCreateSimple }
  | { kind: APIPath.TaskUpdate; id: string }
  | { kind: APIPath.TaskLookup; id: string }
  | { kind: APIPath.TaskOverallScoreLookup; id: string, contestId: string | null }
  | { kind: APIPath.TaskSubmissions; id: string }
  | { kind: APIPath.ProblemSetCreate }
  | { kind: APIPath.ProblemSetUpdate; id: string }
  | { kind: APIPath.ContestCreate }
  | { kind: APIPath.ContestUpdate; id: string };

export function getAPIPath(args: APIPathArguments) {
  switch (args.kind) {
    case APIPath.Login:
      return "/api/v1/auth/login";
    case APIPath.Register:
      return "api/v1/auth/register";
    case APIPath.ForgotPassword:
      return "api/v1/auth/forgot-password";
    case APIPath.ResetPassword:
      return "api/v1/auth/reset-password";
    case APIPath.SubmissionCreate:
      return "/api/v1/submissions";
    case APIPath.UserSubmissions:
      return addSearchParameters("/api/v1/user/submissions", {
        taskId: args.taskId,
      });
    case APIPath.TaskCreate:
      return "/api/v1/tasks";
    case APIPath.TaskCreateSimple:
      return "/api/v1/tasks/simple";
    case APIPath.TaskUpdate:
      return `/api/v1/tasks/${args.id}`;
    case APIPath.TaskLookup:
      return `/api/v1/tasks/${args.id}`;
    case APIPath.TaskOverallScoreLookup:
      if (args.contestId == null) {
        return `/api/v1/tasks/${args.id}/score_overall`;
      } else {
        return `/api/v1/tasks/${args.id}/score_overall?contest_id=${args.contestId}`;
      }
    case APIPath.TaskSubmissions:
      return `/api/v1/tasks/${args.id}/submissions`;
    case APIPath.ProblemSetCreate:
      return "/api/v1/sets";
    case APIPath.ProblemSetUpdate:
      return `/api/v1/sets/${args.id}`;
    case APIPath.ContestCreate:
      return "/api/v1/contests";
    case APIPath.ContestUpdate:
      return `/api/v1/contests/${args.id}`;
    case APIPath.FileUpload:
      return "/api/v1/tasks/files";
    case APIPath.FileHashes:
      return "/api/v1/tasks/files/hashes";
    default:
      throw new UnreachableError(args);
  }
}

function addSearchParameters(base: string, params: Record<string, string | number | undefined>) {
  // This skips anything set to undefined
  let hasKey = false;
  const search = new URLSearchParams();
  for (const key in params) {
    if (params.hasOwnProperty(key) && params[key] !== undefined) {
      hasKey = true;
      search.set(key, `${params[key]}`);
    }
  }
  if (hasKey) {
    return `${base}?${search.toString()}`;
  } else {
    return base;
  }
}
