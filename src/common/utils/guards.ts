export function notNull<T>(x: T | null): x is T {
  return x != null;
}

export function isInteger(str: string): boolean {
  return /^\d+$/.test(str);
}
