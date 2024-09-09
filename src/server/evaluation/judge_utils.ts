import fs from "fs";
import ChildProcess from "child_process";
import { Verdict } from "common/types/constants";
import { IsolateResult } from "./types";
import { ContestantScript } from "common/types/judge";
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
      return callback(isolate);
    } finally {
      await IsolateUtils.cleanup(isolate);
    }
  }

  static async with2<T>(callback: (isolate1: IsolateInstance, isolate2: IsolateInstance) => Promise<T>): Promise<T> {
    const [isolate1, isolate2] = await Promise.all([
      IsolateUtils.init(),
      IsolateUtils.init(),
    ]);
    try {
      return callback(isolate1, isolate2);
    } finally {
      await Promise.all([
        IsolateUtils.cleanup(isolate1),
        IsolateUtils.cleanup(isolate2),
      ]);
    }
  }

  static async readResult(instance: IsolateInstance): Promise<IsolateResult> {
    return {
      verdict: Verdict.Accepted,
      running_memory_byte: 1227,
      running_time_ms: 127,
    };
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
  script: ContestantScript,
  isolate: IsolateInstance,
  submissionRoot: string
): string[] {
  // TODO Memory / Time limits
  const spec = LANGUAGE_SPECS[script.language];

  const argv: string[] = [
    `--box-id=${isolate.name}`,
    `--dir=/submission=${submissionRoot}`,
    "--chdir=/submission",
    `--meta=${isolate.meta}`,
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
