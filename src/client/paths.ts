import { UnreachableError } from 'common/errors';

export enum Path {
  Home = 'Home',
}

export type PathArguments =
  | { kind: Path.Home };

export function getPath(args: PathArguments) {
  switch (args.kind) {
    case Path.Home:
      return '/';
    default:
      throw new UnreachableError(args.kind);
  }
}

export enum APIPath {
  FileHashes = 'FileHashes',
  FileUpload = 'FileUpload',
  TaskCreate = 'TaskCreate',
  TaskUpdate = 'TaskUpdate',
}

export type APIPathArguments =
  | { kind: APIPath.FileHashes }
  | { kind: APIPath.FileUpload }
  | { kind: APIPath.TaskCreate }
  | { kind: APIPath.TaskUpdate, id: string };

export function getAPIPath(args: APIPathArguments) {
  switch (args.kind) {
    case APIPath.TaskCreate:
      return '/api/v1/tasks';
    case APIPath.TaskUpdate:
      return `/api/v1/tasks/${args.id}`;
    case APIPath.FileUpload:
      return '/api/v1/tasks/files';
    case APIPath.FileHashes:
      return '/api/v1/tasks/files/hashes';
    default:
      throw new UnreachableError(args);
  }
}