import { UseFormSetError } from 'react-hook-form';
import type { z, ZodError } from 'zod';


type ObjectErrors<T> = {
  [K in keyof T]?: string[];
};

export enum ResponseKind {
  Success = 'Success',
  ForbiddenError = 'Forbidden',
  ValidationError = 'Validation',
};

export type APIForbiddenErrorType = {
  kind: ResponseKind.ForbiddenError;
};

export type APIValidationErrorType<T extends z.ZodType> = {
  kind: ResponseKind.ValidationError;
  errors: ObjectErrors<z.infer<T>>;
};

export type APIValidationErrorCustomType<Custom> = {
  kind: ResponseKind.ValidationError;
  errors: ObjectErrors<Custom>;
};

export type APISuccessResponse<T> = {
  kind: ResponseKind.Success;
  data: T;
};

export const APIForbiddenError: APIForbiddenErrorType = {
  kind: ResponseKind.ForbiddenError,
};

export function zodValidationError<T extends z.ZodType>(errors: ZodError): APIValidationErrorType<T> {
  const errs: Record<string, string[]> = {};
  for (const issue of errors.issues) {
    const key = issue.path.join(".") || "root";
    if (!(key in errs)) {
      errs[key] = [];
    }
    errs[key].push(issue.message);
  }

  return {
    kind: ResponseKind.ValidationError,
    errors: errs as Partial<Record<keyof z.infer<T>, string[]>>,
  };
}

export function customValidationError<Custom>(errors: ObjectErrors<Custom>): APIValidationErrorCustomType<Custom> {
  return {
    kind: ResponseKind.ValidationError,
    errors: errors,
  };
}

export function makeSuccessResponse<T>(data: T): APISuccessResponse<T> {
  return {
    kind: ResponseKind.Success,
    data: data,
  };
}

export function applyValidationErrors<T extends {}>(setError: UseFormSetError<T>, errors: ObjectErrors<T>) {
  const keys = Object.keys(errors);
  for (const key of keys) {
    if (!errors.hasOwnProperty(key)) {
      continue;
    }
    const keyt = key as keyof T;
    const err = errors[keyt];
    if (err && err.length > 0) {
      setError(key as any, { message: err[0] });
    }
  }
}
