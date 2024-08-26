export class UnreachableError extends Error {
  constructor(value: never) {
    super();
    this.message = `Unreachable Error: ${value}`;
  }
}

export function UnreachableCheck(_value: never): null {
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
