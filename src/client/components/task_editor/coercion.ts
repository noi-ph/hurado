import {
  TaskAttachmentSSR,
  TaskCreditSSR,
  TaskFileSSR,
  TaskSSR,
  TaskSubtaskSSR,
  TestDataSSR,
} from "common/types";
import {
  EditorKind,
  TaskAttachmentED,
  TaskCreditED,
  TaskED,
  TaskFileSaved,
  TaskSubtaskED,
  TaskTestDataED,
} from "./types";

export function coerceTaskED(ssr: TaskSSR): TaskED {
  const files = ssr.files.map((x) => coerceTaskFileED(x));
  const filesById: Map<string, TaskFileSaved> = new Map(files.map((f) => [f.id, f]));

  const task: TaskED = {
    id: ssr.id,
    slug: ssr.slug,
    title: ssr.title,
    description: ssr.description,
    statement: ssr.statement,
    checker: ssr.checker,
    credits: ssr.credits.map(coerceTaskCreditED),
    attachments: ssr.attachments.map((x) => coerceTaskAttachmentED(x, filesById)),
    subtasks: ssr.subtasks.map((x) => coerceTaskSubtaskED(x, filesById)),
    files,
  };
  return task;
}

function coerceTaskFileED(ssr: TaskFileSSR): TaskFileSaved {
  const eid = nextEID();
  return {
    kind: EditorKind.Saved,
    id: ssr.id,
    hash: ssr.hash,
    eid,
  };
}

function coerceTestDataED(ssr: TestDataSSR, filesById: Map<string, TaskFileSaved>): TaskTestDataED {
  const inputFile = filesById.get(ssr.input_file_id);
  const outputFile = filesById.get(ssr.output_file_id);
  const judgeFile = ssr.judge_file_id == null ? null : filesById.get(ssr.judge_file_id) ?? null;
  if (
    inputFile == null ||
    outputFile == null ||
    (judgeFile == null && ssr.judge_file_id != null)
  ) {
    throw new Error("Missing File ID");
  }

  return {
    kind: EditorKind.Saved,
    id: ssr.id,
    name: ssr.name,
    input_file: inputFile,
    input_file_name: ssr.input_file_name,
    output_file: outputFile,
    output_file_name: ssr.input_file_name,
    judge_file: judgeFile,
    judge_file_name: ssr.input_file_name,
    is_sample: ssr.is_sample,
    deleted: false,
  };
}

function coerceTaskAttachmentED(
  ssr: TaskAttachmentSSR,
  filesById: Map<string, TaskFileSaved>
): TaskAttachmentED {
  const saved = filesById.get(ssr.file_id);
  if (saved == null) {
    throw new Error("Missing File ID");
  }
  return {
    kind: EditorKind.Saved,
    id: ssr.id,
    path: ssr.path,
    file: saved,
    mime_type: ssr.mime_type,
    deleted: false,
  };
}

function coerceTaskSubtaskED(
  ssr: TaskSubtaskSSR,
  filesById: Map<string, TaskFileSaved>
): TaskSubtaskED {
  const data = ssr.test_data
    .sort((a, b) => a.order - b.order)
    .map((x) => coerceTestDataED(x, filesById));
  return {
    kind: EditorKind.Saved,
    id: ssr.id,
    name: ssr.name,
    score_max: ssr.score_max,
    test_data: data,
    deleted: false,
  };
}

function coerceTaskCreditED(ssr: TaskCreditSSR): TaskCreditED {
  return {
    kind: EditorKind.Saved,
    id: ssr.id,
    name: ssr.name,
    role: ssr.role,
    deleted: false,
  };
}

let currentEID: number = 1;
export function nextEID(): number {
  return currentEID++;
}
