// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { UseFormSetError } from "react-hook-form";

export class UnreachableError extends Error {
  constructor(value: never) {
    super();
    this.message = `Unreachable Error: ${value}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
export function UnreachableCheck(_value: never): null {
  // This is a noop function that lets you tell typescript that you expect
  // a value to be unreachable. This is useful for exhaustiveness checks.
  return null;
}

export function UnreachableDefault(value: never, default_?: unknown): unknown {
  if (default_ !== undefined) {
    return default_;
  }
  return value;
}

export class NotYetImplementedError extends Error {
  constructor(value: unknown) {
    super();
    this.message = `Not Yet Implemented: ${value}`;
  }
}

export class TaskConfigurationError extends Error {
  constructor(id: string, hint: string) {
    super();
    this.message = `Invalid Task '${id}': ${hint}`;
  }
}

export class UniquenessConflictError extends Error {
  constructor(value: unknown) {
    super();
    this.message = `Uniqueness Conflict: ${value}`;
  }
}
