import fs from "fs";
import path from "path";
import { Language, ProgrammingLanguage } from "common/types/constants";
import type {JudgeSubmission, JudgeTaskBatch, JudgeTaskCommunication } from "common/types/judge";
import { CompilationResult } from "./types";

// See https://github.com/criyle/go-judge/tree/master?tab=readme-ov-file#rest-api-interface
export const GO_JUDGE_BASE_URL = "http://hurado-go-judge:5050";

type EvalSpec = {
  sourceFileName: string;
  compileCmd: string[];
  execFileNames: string[];
  runCmd: string[];
};

export const EVAL_SPECS: Record<ProgrammingLanguage, EvalSpec> = {
  [Language.Python3]: {
    sourceFileName: "main.py",
    compileCmd: [
      "/usr/bin/python3",
      "-c",
      "import py_compile; py_compile.compile('main.py', 'main.pyc', doraise=True)",
    ],
    execFileNames: ["main.py", "main.pyc"],
    runCmd: ["/usr/bin/python3", "main.py"],
  },
  [Language.CPP]: {
    sourceFileName: "main.cpp",
    compileCmd: ["/usr/bin/g++", "-O2", "-std=c++11", "-o", "main", "main.cpp"],
    execFileNames: ["main"],
    runCmd: ["main"],
  },
  [Language.Java]: {
    sourceFileName: "Main.java",
    compileCmd: ["/usr/bin/javac", "Main.java"],
    execFileNames: ["Main.class"],
    runCmd: ["/usr/bin/java", "Main"],
  },
};

export async function compileSubmission(
  task: JudgeTaskBatch | JudgeTaskCommunication,
  submission: JudgeSubmission,
  taskDir: string,
  submissionDir: string
): Promise<CompilationResult<GoJudgeEvaluationContext>> {
  const lang = submission.language as ProgrammingLanguage;
  const spec = EVAL_SPECS[lang];
  const sourcePath = path.join(submissionDir, getLanguageFilename(lang));
  const reqBody = {
    "cmd": [
      {
        "args": spec.compileCmd,
        "env": ["PATH=/usr/bin:/bin"],
        "files": [
          {
            "content": "",
          },
          {
            "name": "stdout",
            "max": 10240,
          },
          {
            "name": "stderr",
            "max": 10240,
          },
        ],
        "cpuLimit": 10000000000,
        "memoryLimit": 104857600,
        "procLimit": 50,
        "copyIn": {
          [spec.sourceFileName]: {
            "content": fs.readFileSync(sourcePath, "utf8"),
          },
        },
        "copyOut": ["stdout", "stderr"],
        "copyOutCached": spec.execFileNames,
      },
    ],
  };
  const res = await fetch(`${GO_JUDGE_BASE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  });
  if (res.status != 200) {
    // TODO: Handle system error
    throw new Error(`Unexpected response while compiling: ${JSON.stringify(await res.blob())}`);
  }
  const resBody = (await res.json())[0];
  if (resBody.status !== "Accepted") {
    // TODO: Handle compilation error
    throw new Error(`Unexpected response while compiling: ${JSON.stringify(resBody)}`);
  }
  return {
    compile_time_ms: Math.round(resBody.time / 1000000),
    compile_memory_byte: resBody.memory,
    context: {
      submissionRoot: submissionDir,
      judgeRoot: taskDir,
      language: lang,
      execFileIds: resBody.fileIds,
      checker: task.checker,
    },
  };
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
