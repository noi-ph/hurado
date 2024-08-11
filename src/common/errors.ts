export class UnreachableError extends Error {
  constructor(value: never) {
    super();
    this.message = `Unreachable Error: ${value}`;
  }
}