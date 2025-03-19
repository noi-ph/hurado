export const LIMITS_WALL_TIME_BONUS_MS = 30_000;

export const LIMITS_JUDGE_TIME_LIMIT_MS = 60_000; // 1 minute
export const LIMITS_JUDGE_MEMORY_LIMIT_BYTE = 1_000_000_000; // 1GB

export const LIMITS_DEFAULT_COMPILE_TIME_LIMIT_MS = 10_000;
export const LIMITS_DEFAULT_COMPILE_MEMORY_LIMIT_BYTE = 1_000_000_000; // 1GB

export const LIMITS_DEFAULT_RUN_TIME_LIMIT_MS = 3_000;

// Anything below around 15_000_000 will cause all Python programs to fail
export const LIMITS_DEFAULT_RUN_MEMORY_LIMIT_BYTE = 100_000_000; // 100MB

export const LIMITS_DEFAULT_SUBMISSION_SIZE_LIMIT_BYTE = 640000; // 64KB

export function WallTimeLimitSeconds(timeLimitMS: number) {
  // Accurate to 4 decimal places
  return Math.floor(timeLimitMS + LIMITS_WALL_TIME_BONUS_MS) / 1000;
}

export function TimeLimitSeconds(timeLimitMS: number) {
  // Accurate to 4 decimal places
  return Math.floor(timeLimitMS) / 1000;
}

export function MemoryLimitKilobytes(byteLimit: number) {
  // Must be a whole number
  return Math.floor(byteLimit / 1000);
}
