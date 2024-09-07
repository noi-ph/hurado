import fs from "fs";
import path from "path";
import { Verdict } from "common/types/constants";
import type { JudgeTaskDataCommunication } from "common/types/judge";
import { EvaluationResult, GoJudgeEvaluationContext } from "./types";
import { EVAL_SPECS, GO_JUDGE_BASE_URL } from "./judge_compile";


export async function evaluateTaskDataForCommunication(
  context: GoJudgeEvaluationContext,
  data: JudgeTaskDataCommunication
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
  const res = await fetch(`${GO_JUDGE_BASE_URL}/run`, {
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
