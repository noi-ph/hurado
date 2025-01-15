import {
  TaskAttachmentDTO,
  TaskCreditDTO,
  TaskDTO,
  TaskSubtaskDTO,
  TaskDataDTO,
  TaskScriptDTO,
  TaskSampleIO_DTO,
} from "common/validation/task_validation";
import {
  TaskCreditED,
  TaskED,
  TaskSubtaskED,
  TaskDataED,
  TaskScriptED,
  TaskCheckerED,
  TaskSampleIO_ED,
} from "./types";
import { CheckerKind, Language, TaskType } from "common/types/constants";
import { CommonAttachmentED, EditorKind } from "../common_editor";
import { createEmptyScript } from "./task_editor_utils";

export function coerceTaskED(dto: TaskDTO): TaskED {
  let checker: TaskCheckerED;
  if (dto.checker_kind !== CheckerKind.Custom) {
    checker =  {
      kind: dto.checker_kind,
    }
  } else {
    const checkerScript = dto.scripts.find(x => x.file_name === dto.checker_file_name);
    checker = {
      kind: dto.checker_kind,
      script: checkerScript == null
        ? createEmptyScript()
        : coerceTaskScriptED(checkerScript),
    };
  }

  let communicator: TaskScriptED | null = null;
  if (dto.type === TaskType.Communication) {
    const communicatorScript = dto.scripts.find(x => x.file_name === dto.communicator_file_name);
    communicator = communicatorScript == null
      ? createEmptyScript()
      : coerceTaskScriptED(communicatorScript);
  }

  const task: TaskED = {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description,
    statement: dto.statement,
    checker: checker,
    communicator: communicator,
    credits: dto.credits.map(coerceTaskCreditED),
    attachments: dto.attachments.map((x) => coerceTaskAttachmentED(x)),
    type: dto.type,
    flavor: 'flavor' in dto ? dto.flavor : null,
    subtasks: dto.subtasks.map((x) => coerceTaskSubtaskED(x)),
    sample_IO: dto.sample_IO.map((x) => coerceTaskSampleIO(x)),
    is_public: dto.is_public,
  };
  return task;
}

function coerceTaskCreditED(dto: TaskCreditDTO): TaskCreditED {
  return {
    kind: EditorKind.Saved,
    id: dto.id as string,
    name: dto.name,
    role: dto.role,
    deleted: false,
  };
}

function coerceTaskAttachmentED(dto: TaskAttachmentDTO): CommonAttachmentED {
  return {
    kind: EditorKind.Saved,
    id: dto.id as string,
    path: dto.path,
    file: {
      kind: EditorKind.Saved,
      hash: dto.file_hash,
    },
    mime_type: dto.mime_type,
    deleted: false,
  };
}

function coerceTaskSubtaskED(dto: TaskSubtaskDTO): TaskSubtaskED {
  return {
    kind: EditorKind.Saved,
    id: dto.id as string,
    name: dto.name,
    score_max: dto.score_max,
    data: dto.data.map(coerceTaskDataED),
    deleted: false,
  };
}

function coerceTaskDataED(dto: TaskDataDTO): TaskDataED {
  return {
    kind: EditorKind.Saved,
    id: dto.id as string,
    name: dto.name,
    input_file:
      "input_file_hash" in dto
        ? {
            kind: EditorKind.Saved,
            hash: dto.input_file_hash,
          }
        : null,
    input_file_name: "input_file_name" in dto ? dto.input_file_name : null,
    judge_file: {
      kind: EditorKind.Saved,
      hash: dto.judge_file_hash,
    },
    judge_file_name: dto.judge_file_name,
    deleted: false,
  };
}

function coerceTaskScriptED(dto: TaskScriptDTO): TaskScriptED {
  return {
    kind: EditorKind.Saved,
    id: dto.id as string,
    file_name: dto.file_name,
    argv: dto.argv ?? [],
    language: dto.language,
    file: {
      kind: EditorKind.Saved,
      hash: dto.file_hash,
    },
  }
}

function coerceTaskSampleIO(dto: TaskSampleIO_DTO): TaskSampleIO_ED {
  return {
    kind: EditorKind.Saved,
    id: dto.id as string,
    input: dto.input,
    output: dto.output,
    explanation: dto.explanation,
  };
}