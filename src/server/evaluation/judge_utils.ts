import fs from "fs";
import ChildProcess from "child_process";
import { Verdict } from "common/types/constants";
import { IsolateResult } from "./types";
import { ContestantScript, JudgeTaskBatch, JudgeTaskCommunication } from "common/types/judge";
import { LANGUAGE_SPECS } from "./judge_compile";

export const ISOLATE_BIN = "/usr/local/bin/isolate";
const ISOLATE_DIRECTORY = "/var/local/lib/isolate";

export type IsolateInstance = {
  name: string;
  meta: string;
};

export class IsolateUtils {
  static async with<T>(callback: (isolate: IsolateInstance) => Promise<T>): Promise<T> {
    const isolate = await IsolateUtils.init();
    try {
      return await callback(isolate);
    } finally {
      await IsolateUtils.cleanup(isolate);
    }
  }

  static async with2<T>(
    callback: (isolate1: IsolateInstance, isolate2: IsolateInstance) => Promise<T>
  ): Promise<T> {
    const [isolate1, isolate2] = await Promise.all([IsolateUtils.init(), IsolateUtils.init()]);
    try {
      return await callback(isolate1, isolate2);
    } finally {
      await Promise.all([IsolateUtils.cleanup(isolate1), IsolateUtils.cleanup(isolate2)]);
    }
  }

  static async readResult(instance: IsolateInstance): Promise<IsolateResult> {
    const result: IsolateResult = {
      verdict: Verdict.JudgeFailed,
      running_time_ms: 0,
      running_memory_byte: 0,
    };

    let exitcode: string | null = null;
    let exitsig: string | null = null;
    let status: string | null = null;
    let maxRSS: string | null = null;
    let time: string | null = null;
    let timeWall: string | null = null;

    const data = await fs.promises.readFile(instance.meta, { encoding: "utf-8" });
    for (const line of data.split("\n")) {
      const splitter = line.indexOf(":");
      const key = splitter >= 0 ? line.substring(0, splitter) : line;
      const value = splitter >= 0 ? line.substring(splitter + 1).trim() : "";
      switch (key) {
        case "status":
          status = value;
          break;
        case "exitsig":
          exitsig = value;
          break;
        case "exitcode":
          exitcode = value;
          break;
        case "max-rss":
          maxRSS = value;
          break;
        case "time":
          time = value;
          break;
        case "time-wall":
          timeWall = value;
          break;
        default:
          // Do nothing
      }
    }

    if (status == "TO") {
      result.verdict = Verdict.TimeLimitExceeded;
    } else if (status === "RE") {
      result.verdict = Verdict.RuntimeError;
    } else if (status === "SG") {
      result.verdict = Verdict.MemoryLimitExceeded;
    } else if (exitcode === "0") {
      result.verdict = Verdict.Accepted;
    }

    if (maxRSS != null && !isNaN(+maxRSS)) {
      result.running_memory_byte = (+maxRSS) * 1000;
    }

    if (time != null && !isNaN(+time)) {
      result.running_time_ms = (+time) * 1000;
    }

    return result;
  }

  private static async init(): Promise<IsolateInstance> {
    const fnames = await fs.promises.readdir(ISOLATE_DIRECTORY);
    const taken = new Set(fnames);
    const name = IsolateUtils.generateIsolateID(taken);
    const meta = `/tmp/isolate.${name}.meta`;
    await runChildProcess([ISOLATE_BIN, "--init", "--box-id", name]);
    return {
      name,
      meta,
    };
  }

  private static async cleanup(instance: IsolateInstance): Promise<void> {
    try {
      Promise.all([
        runChildProcess([ISOLATE_BIN, "--cleanup", `--box-id=${instance.name}`]),
        fs.promises.rm(instance.meta),
      ]);
    } catch (e) {
      // Do nothing
      console.debug("Failed to cleanup isolate", e);
    }
  }

  private static generateIsolateID(taken: Set<string>): string {
    // Generate an un-taken number within this range inclusive. Why this range? Trip lang.
    const min = 17;
    const max = 999;
    while (true) {
      const id = generateRandomInt(min, max).toString();
      if (!taken.has(id)) {
        return id;
      }
    }
  }
}

function generateRandomInt(min: number, max: number) {
  // Generate a random number in the range [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeContestantArgv(
  task: JudgeTaskBatch | JudgeTaskCommunication,
  script: ContestantScript,
  isolate: IsolateInstance,
  submissionRoot: string
): string[] {
  const spec = LANGUAGE_SPECS[script.language];

  const timeLimitSeconds = task.time_limit_ms != null
    ? task.time_limit_ms / 1000
    : 3; // 3 seconds

  const timeLimit = `${timeLimitSeconds}`;
  const wallTimeLimit = `${timeLimitSeconds + 30}`; // 30 second bonus for wall time

  const memLimit = task.memory_limit_byte != null
    ? `${task.memory_limit_byte / 1000}`
    : "100000"; // 100MB

    const argv: string[] = [
    `--box-id=${isolate.name}`,
    `--dir=/submission=${submissionRoot}`,
    "--chdir=/submission",
    `--meta=${isolate.meta}`,
    `--time=${timeLimit}`,
    `--mem=${memLimit}`,
    `--wall-time=${wallTimeLimit}`,
    "--run",
    "--",
  ];

  if (spec.interpreter == null) {
    argv.push(`/submission/${script.exe_name}`);
  } else if (script.exe_name != null) {
    argv.push(spec.interpreter);
    argv.push(script.exe_name);
  } else {
    throw new Error("Missing script exe name");
  }

  return argv;
}

export function runChildProcess(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = ChildProcess.spawn(args[0], args.slice(1));

    child.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}
