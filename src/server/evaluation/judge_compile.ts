import path from "path";
import ChildProcess from "child_process";
import { Language, ProgrammingLanguage, Verdict } from "common/types/constants";
import { JudgeScript, JudgeSubmission } from "common/types/judge";
import { CompilationResult } from "./types";
import { ISOLATE_EXECUTABLE, IsolateUtils } from "./judge_utils";

type LanguageSpec = {
  getExecutableName(source: string): string;
  getCompileCommand(source: string, exe: string): string[] | null;
  interpreter: string | null;
};

export const LANGUAGE_SPECS: Record<ProgrammingLanguage, LanguageSpec> = {
  [Language.Python3]: {
    getExecutableName: (source: string) => {
      return source;
    },
    getCompileCommand: (source: string, exe: string) => {
      return null;
    },
    interpreter: "/usr/bin/python3",
  },
  [Language.CPP]: {
    getExecutableName: (source: string) => {
      return removeLastExtension(source);
    },
    getCompileCommand: (source: string, exe: string) => {
      return ["/usr/bin/g++", "-O2", "-std=c++11", "-o", exe, source];
    },
    interpreter: null,
  },
  [Language.Java]: {
    getExecutableName: (source: string) => {
      return removeLastExtension(source);
    },
    getCompileCommand: (source: string, exe: string) => {
      return ["/usr/bin/g++", "-O2", "-std=c++11", "-o", exe, source];
    },
    interpreter: "/usr/bin/java",
  },
};

export async function compileSubmission(
  submission: JudgeSubmission,
  submissionDir: string
): Promise<CompilationResult> {
  const language = submission.language as ProgrammingLanguage;
  const spec = LANGUAGE_SPECS[language];
  const srcName = getLanguageFilename(language);
  const exeName = spec.getExecutableName(srcName);
  return compileLocalSource(language, submissionDir, srcName, exeName);
}

export async function compileJudgeScriptAndMutate(
  script: JudgeScript,
  taskDir: string
): Promise<JudgeScript> {
  // Note: This function mutates JudgeScript!!
  const specs = LANGUAGE_SPECS[script.language];
  const srcName = script.file_name;
  const exeName = specs.getExecutableName(srcName);
  const result = await compileLocalSource(script.language, taskDir, srcName, exeName);
  script.exe_name = result.exe_name;
  return script;
}

export async function compileLocalSource(
  language: ProgrammingLanguage,
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

  const isolate = await IsolateUtils.init();
  try {
    const argv: string[] = [
      `--box-id=${isolate.name}`,
      `--dir=/submission=${root}:rw`,
      "--chdir=/submission",
      "--env=PATH",
      "--mem=512000",   // 512 MB memory limit to compile
      "--time=10",      // 10 seconds time limit to compile
      "--processes=8",  // 8 processes to compile
      `--meta=${isolate.meta}`,
      "--run",
      "--",
      ...command,
    ];
    const child = ChildProcess.spawn(ISOLATE_EXECUTABLE, argv, {
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
    return await promise;
  } finally {
    await IsolateUtils.cleanup(isolate);
  }
}

export function getLanguageFilename(language: Language) {
  switch (language) {
    case Language.CPP:
      return "main.cpp";
    case Language.Java:
      return "main.java";
    case Language.Python3:
      return "main.py";
    default:
      return "main.txt";
  }
}

function removeLastExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
