export function notNull<T>(x: T | null): x is T {
  return x != null;
}
