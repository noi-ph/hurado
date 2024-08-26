import { Language, ProgrammingLanguage, Verdict } from "common/types/constants";
import type { JudgeChecker, JudgeSubmission, JudgeTaskBatch, JudgeTaskDataBatch } from "common/types/judge";
import fs from "fs";
import path from "path";
import { CompilationResult, EvaluationResult, getLanguageFilename } from ".";

// See https://github.com/criyle/go-judge/tree/master?tab=readme-ov-file#rest-api-interface
const baseURL = "http://hurado-go-judge:5050";

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

export type GoJudgeEvaluationContext = {
  submissionRoot: string;
  judgeRoot: string;
  language: ProgrammingLanguage;
  execFileIds: Record<string, string>;
  checker: JudgeChecker;
};

export async function compileSubmission(
  task: JudgeTaskBatch,
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
  const res = await fetch(`${baseURL}/run`, {
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

export async function evaluateTaskData(
  context: GoJudgeEvaluationContext,
  data: JudgeTaskDataBatch
): Promise<EvaluationResult> {
  const spec = EVAL_SPECS[context.language];
  const inputPath = path.join(context.judgeRoot, data.input_file_name);
  const judgePath = path.join(context.judgeRoot, data.judge_file_name);
  const answerPath = path.join(context.submissionRoot, data.judge_file_name);

  const reqBody = {
    "cmd": [
      {
        "args": spec.runCmd,
        "env": ["PATH=/usr/bin:/bin"],
        "files": [
          {
            "content": fs.readFileSync(inputPath, "utf8"),
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
        "copyIn": Object.fromEntries(
          Object.entries(context.execFileIds).map(([k, v]) => [k, { "fileId": v }])
        ),
        "copyOut": ["stdout", "stderr"],
        "copyOutCached": [],
      },
    ],
  };
  const res = await fetch(`${baseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  });
  if (res.status != 200) {
    // TODO: Handle system error
    throw new Error(`Unexpected response while running: ${JSON.stringify(await res.blob())}`);
  }
  const resBody = (await res.json())[0];
  let verdict: Verdict =
    {
      "Accepted": Verdict.Accepted, // provisional, not yet compared to answer
      "Memory Limit Exceeded": Verdict.MemoryLimitExceeded,
      "Time Limit Exceeded": Verdict.TimeLimitExceeded,
      "Internal Error": Verdict.RuntimeError, // TODO: Add a new verdict to handle this?
    }[resBody.status as string] ?? Verdict.RuntimeError;
  let score = 0;
  if (verdict === Verdict.Accepted) {
    // Just verbatim comparison for now.
    const answer = fs.readFileSync(judgePath, "utf8");
    fs.writeFileSync(answerPath, resBody.files.stdout, "utf8");

  }
  return {
    verdict,
    raw_score: score,
    running_time_ms: Math.round(resBody.time / 1000000),
    running_memory_byte: resBody.memory,
  };
}
