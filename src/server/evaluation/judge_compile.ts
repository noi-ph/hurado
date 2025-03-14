import ChildProcess from "child_process";
import { UnreachableCheck } from "common/errors";
import { Language, ProgrammingLanguage, Verdict } from "common/types/constants";
import { JudgeScript, JudgeSubmission, JudgeTaskBatch, JudgeTaskCommunication } from "common/types/judge";
import { CompilationResult } from "./types";
import { ISOLATE_BIN, IsolateUtils } from "./judge_utils";
import { getWallTimeLimit, LIMITS_DEFAULT_COMPILE_MEMORY_LIMIT_KB, LIMITS_DEFAULT_COMPILE_TIME_LIMIT_SECONDS } from "./judge_constants";

type LanguageSpec = {
  getExecutableName(source: string): string;
  getCompileCommand(source: string, exe: string): string[] | null;
  interpreter: string | null;
};

export const LANGUAGE_SPECS: Record<ProgrammingLanguage, LanguageSpec> = {
  [Language.CPP]: {
    getExecutableName: (source: string) => {
      return removeLastExtension(source);
    },
    getCompileCommand: (source: string, exe: string) => {
      return ["/usr/bin/g++", "-O2", "-std=c++17", "-o", exe, source];
    },
    interpreter: null,
  },
  [Language.Java]: {
    getExecutableName: (source: string) => {
      return removeLastExtension(source);
    },
    getCompileCommand: (source: string, _exe: string) => {
      return ["/usr/bin/javac", source];
    },
    interpreter: "/usr/bin/java",
  },
  [Language.Python3]: {
    getExecutableName: (source: string) => {
      return source;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    getCompileCommand: (source: string, exe: string) => {
      return null;
    },
    interpreter: "/usr/bin/python3",
  },
  [Language.PyPy3]: {
    getExecutableName: (source: string) => {
      return source;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    getCompileCommand: (source: string, exe: string) => {
      return null;
    },
    interpreter: "/usr/bin/pypy3",
  },
};

export async function compileSubmission(
  task: JudgeTaskBatch | JudgeTaskCommunication,
  submission: JudgeSubmission,
  submissionDir: string
): Promise<CompilationResult> {
  const language = submission.language as ProgrammingLanguage;
  const spec = LANGUAGE_SPECS[language];
  const srcName = getLanguageFilename(language);
  const exeName = spec.getExecutableName(srcName);
  return compileLocalSource(
    language,
    task.compile_time_limit_ms,
    task.compile_memory_limit_byte,
    submissionDir,
    srcName,
    exeName,
  );
}

export async function compileJudgeScriptAndMutate(
  script: JudgeScript,
  taskDir: string
): Promise<JudgeScript> {
  // Note: This function mutates the JudgeScript argument!!
  const specs = LANGUAGE_SPECS[script.language];
  const srcName = script.file_name;
  const exeName = specs.getExecutableName(srcName);
  const result = await compileLocalSource(
    script.language,
    null, // Judges get the default time limit
    null, // Judges get the default memory limit
    taskDir,
    srcName,
    exeName,
  );
  script.exe_name = result.exe_name;
  return script;
}

export async function compileLocalSource(
  language: ProgrammingLanguage,
  time_limit_ms: number | null,
  memory_limit_byte: number | null,
  root: string,
  src_name: string,
  exe_name: string,
): Promise<CompilationResult> {
  const specs = LANGUAGE_SPECS[language];
  const command = specs.getCompileCommand(src_name, exe_name);
  if (!command) {
    return {
      verdict: Verdict.Accepted,
      compile_memory_byte: 0,
      compile_time_ms: 0,
      exe_name: exe_name,
    };
  }

  const timeLimitSeconds = time_limit_ms != null
    ? time_limit_ms / 1000
    : LIMITS_DEFAULT_COMPILE_TIME_LIMIT_SECONDS;

  const timeLimit = `${timeLimitSeconds}`;
  const wallTimeLimit = `${getWallTimeLimit(timeLimitSeconds)}`;
  const memLimit = memory_limit_byte != null
    ? `${Math.floor(memory_limit_byte / 1000)}`
    : `${LIMITS_DEFAULT_COMPILE_MEMORY_LIMIT_KB}`;

  return IsolateUtils.with(async (isolate) => {
    const argv: string[] = [
      `--box-id=${isolate.name}`,
      "--dir=/opt/lang=/opt/lang",
      `--dir=/mount=${root}:rw`,
      "--chdir=/mount",
      "--env=PATH",
      `--meta=${isolate.meta}`,
      `--time=${timeLimit}`,
      `--wall-time=${wallTimeLimit}`,
      `--mem=${memLimit}`,
      "--processes=4",
      "--run",
      "--",
      ...command,
    ];
    const child = ChildProcess.spawn(ISOLATE_BIN, argv, {
      stdio: [null, process.stdout, process.stderr],
    });

    const promise = new Promise<CompilationResult>((resolve) => {
      child.on("exit", async () => {
        try {
          const result = await IsolateUtils.readResult(isolate);

          resolve({
            verdict: result.verdict,
            compile_memory_byte: result.running_memory_byte,
            compile_time_ms: result.running_time_ms,
            exe_name,
          });
        } catch (e) {
          console.error("Failed to parse isolate result", e);
          resolve({
            verdict: Verdict.JudgeFailed,
            compile_memory_byte: 0,
            compile_time_ms: 0,
            exe_name,
          });
        }
      });
    });
    return promise;
  });
}

export function getLanguageFilename(language: Language) {
  switch (language) {
    case Language.CPP:
      return "main.cpp";
    case Language.Java:
      return "Main.java";
    case Language.Python3:
      return "main.py";
    case Language.PyPy3:
      return "main.py";
    case Language.PlainText:
      return "main.txt";
    default:
      UnreachableCheck(language);
      return "main.txt";
  }
}

function removeLastExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
