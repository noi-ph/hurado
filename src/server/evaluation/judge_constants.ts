export const LIMITS_WALL_TIME_BONUS = 30;

export const LIMITS_JUDGE_TIME_LIMIT_SECONDS = 60;
export const LIMITS_JUDGE_MEMORY_LIMIT_KB = 1024000;  // 1GB

export const LIMITS_DEFAULT_COMPILE_TIME_LIMIT_SECONDS = 10;
export const LIMITS_DEFAULT_COMPILE_MEMORY_LIMIT_KB = 10240000; // 1GB

export const LIMITS_DEFAULT_RUN_TIME_LIMIT_SECONDS = 3;
// Anything below around 15000 will cause all Python programs to fail
export const LIMITS_DEFAULT_RUN_MEMORY_LIMIT_KB = 100000; // 100MB

export const LIMITS_DEFAULT_SUBMISSION_SIZE_LIMIT_BYTE = 640000; // 64KB

export function getWallTimeLimit(timeLimitSeconds: number) {
  return timeLimitSeconds + LIMITS_WALL_TIME_BONUS;
}
