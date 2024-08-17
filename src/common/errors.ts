export class UnreachableError extends Error {
  constructor(value: never) {
    super();
    this.message = `Unreachable Error: ${value}`;
  }
}

export function UnreachableDefault(value: never, default_?: unknown): unknown {
  if (default_ != null) {
    return default_;
  }
  return value;
}