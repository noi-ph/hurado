import fs from "fs";
import { Verdict } from "common/types/constants";
import { IsolateResult } from "./types";
import ChildProcess from "child_process";

export function runChildProcess(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = ChildProcess.spawn(args[0], args.slice(1));

    child.on("close", (code) => {
      resolve(code ?? 0);
    });
  });
}

export const ISOLATE_EXECUTABLE = "/usr/local/bin/isolate";
const ISOLATE_DIRECTORY = "/var/local/lib/isolate";

type IsolateInstance = {
  name: string;
  meta: string;
};

export class IsolateUtils {
  static async init(): Promise<IsolateInstance> {
    const fnames = await fs.promises.readdir(ISOLATE_DIRECTORY);
    const taken = new Set(fnames);
    const name = generateIsolateID(taken);
    const meta = `/tmp/isolate.${name}.meta`;
    await runChildProcess([ISOLATE_EXECUTABLE, "--init", "--box-id", name]);
    return {
      name,
      meta,
    };
  }

  static async cleanup(instance: IsolateInstance): Promise<void> {
    try {
      Promise.all([
        runChildProcess([ISOLATE_EXECUTABLE, "--cleanup", `--box-id=${instance.name}`]),
        fs.promises.rm(instance.meta),
      ]);
    } catch (e) {
      // Do nothing
      console.debug("Failed to cleanup isolate", e);
    }
  }

  static async readResult(instance: IsolateInstance): Promise<IsolateResult> {
    return {
      verdict: Verdict.Accepted,
      running_memory_byte: 1227,
      running_time_ms: 127,
    };
  }
}

function generateRandomInt(min: number, max: number) {
  // Generate a random number in the range [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIsolateID(taken: Set<string>): string {
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
