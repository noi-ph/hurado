import { AxiosResponse } from "axios";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import {
  CommonAttachmentED,
  CommonFileED,
  CommonFileLocal,
  CommonFileSaved,
  CommonFileSaveResult,
  EditorKind,
  getExistingHashes,
  IncompleteHashesException,
  saveLocalFiles,
  SaveResult,
  UnsavedFileException,
} from "client/components/common_editor";
import {
  TaskAttachmentDTO,
  TaskBatchDTO,
  TaskCreditDTO,
  TaskDataBatchDTO,
  TaskDataOutputDTO,
  TaskDTO,
  TaskOutputDTO,
  TaskScriptDTO,
  TaskSubtaskBatchDTO,
  TaskSubtaskOutputDTO,
} from "common/validation/task_validation";
import { NotYetImplementedError, UnreachableError } from "common/errors";
import { CheckerKind, TaskFlavor, TaskType } from "common/types/constants";
import { notNull } from "common/utils/guards";
import { TaskCreditED, TaskED, TaskSubtaskED, TaskDataED, TaskScriptED } from "./types";
import { coerceTaskED } from "./coercion";

export async function saveTask(task: TaskED): Promise<SaveResult<TaskED>> {
  const errors = validateTask(task);
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const unsavedFiles = extractLocalFiles(task);
  for (const unsaved of unsavedFiles) {
    if (unsaved.hash == "") {
      throw new IncompleteHashesException();
    }
  }

  const savedHashesList = await getExistingHashes(unsavedFiles);
  const savedHashes = new Set(savedHashesList);
  const savedFiles = await Promise.all(saveLocalFiles(unsavedFiles, savedHashes));
  const updatedTask = applySavedFileChanges(task, savedFiles);
  const dto = coerceTaskDTO(updatedTask);
  const taskUpdateURL = getAPIPath({ kind: APIPath.TaskUpdate, id: task.id });
  const response: AxiosResponse<TaskDTO> = await http.put(taskUpdateURL, dto);

  return {
    success: true,
    value: coerceTaskED(response.data),
  };
}

function validateTask(task: TaskED): string[] {
  return [];
}

function extractLocalFiles(task: TaskED): CommonFileLocal[] {
  const result: CommonFileLocal[] = [];
  function maybeAddFile(file: CommonFileED | null) {
    if (file != null && file.kind === EditorKind.Local) {
      result.push(file);
    }
  }

  for (const attachment of task.attachments) {
    maybeAddFile(attachment.file);
  }

  for (const subtask of task.subtasks) {
    for (const data of subtask.data) {
      if (task.type !== TaskType.OutputOnly) {
        maybeAddFile(data.input_file);
      }
      maybeAddFile(data.judge_file);
    }
  }

  return result;
}

function applySavedFileChanges(ed: TaskED, changes: CommonFileSaveResult[]): TaskED {
  function maybeReplaceFile(file: CommonFileED | null): CommonFileSaved | null {
    if (file == null) {
      return file;
    } else if (file.kind === EditorKind.Saved) {
      return file;
    }
    for (const change of changes) {
      if (change.local.hash === file.hash) {
        return change.saved;
      }
    }
    throw new UnsavedFileException();
  }

  return {
    ...ed,
    attachments: ed.attachments
      .filter((att) => !att.deleted)
      .map((att) => {
        return {
          ...att,
          file: maybeReplaceFile(att.file),
        };
      }),
    subtasks: ed.subtasks.map((sub) => {
      return {
        ...sub,
        data: sub.data
          .filter((data) => !data.deleted)
          .map((data) => {
            return {
              ...data,
              input_file:
                ed.type !== TaskType.OutputOnly ? maybeReplaceFile(data.input_file) : null,
              judge_file: maybeReplaceFile(data.judge_file),
            };
          }),
      };
    }),
  };
}

function coerceTaskDTO(ed: TaskED): TaskDTO {
  const locals = extractLocalFiles(ed);
  if (locals.length > 0) {
    throw new UnsavedFileException();
  }

  if (ed.type === TaskType.Batch) {
    return coerceTaskBatchDTO(ed);
  } else if (ed.type === TaskType.Communication) {
    throw new NotYetImplementedError(ed.type);
  } else if (ed.type === TaskType.OutputOnly) {
    return coerceTaskOutputDTO(ed);
  } else {
    throw new UnreachableError(ed.type);
  }
}

function coerceTaskCreditDTO(ed: TaskCreditED, idx: number): TaskCreditDTO | null {
  if (ed.deleted) {
    return null;
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      role: ed.role,
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      role: ed.role,
    };
  }
}

function coerceTaskAttachmentDTO(ed: CommonAttachmentED): TaskAttachmentDTO | null {
  if (ed.deleted) {
    return null;
  } else if (ed.file == null || ed.file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  }

  if (ed.kind == EditorKind.Local) {
    return {
      path: ed.path,
      mime_type: ed.mime_type,
      file_hash: ed.file.hash,
    };
  } else {
    return {
      id: ed.id,
      path: ed.path,
      mime_type: ed.mime_type,
      file_hash: ed.file.hash,
    };
  }
}

function coerceTaskScriptDTO(ed: TaskScriptED): TaskScriptDTO {
  if (ed.kind == EditorKind.Local) {
    return {
      file_name: ed.file_name,
      file_hash: ed.file_hash,
      language: ed.language,
      argv: ed.argv,
    };
  } else {
    return {
      id: ed.id,
      file_name: ed.file_name,
      file_hash: ed.file_hash,
      language: ed.language,
      argv: ed.argv,
    };
  }
}

function coerceTaskBatchDTO(ed: TaskED): TaskBatchDTO {
  return {
    // Common
    id: ed.id,
    slug: ed.slug,
    title: ed.title,
    description: ed.description ?? null,
    statement: ed.statement,
    is_public: true,
    score_max: ed.subtasks.reduce((acc, subtask) => acc + subtask.score_max, 0),
    credits: ed.credits.map(coerceTaskCreditDTO).filter(notNull),
    attachments: ed.attachments.map(coerceTaskAttachmentDTO).filter(notNull),
    scripts: [],
    // Batch-only
    type: TaskType.Batch,
    time_limit_ms: 3000,
    memory_limit_byte: 1000000,
    compile_time_limit_ms: null,
    compile_memory_limit_byte: null,
    submission_size_limit_byte: null,
    checker_kind: ed.checker.kind,
    checker_file_name: undefined,
    subtasks: ed.subtasks.map(coerceSubtaskBatchDTO).filter(notNull),
  };
}

function coerceSubtaskBatchDTO(ed: TaskSubtaskED): TaskSubtaskBatchDTO | null {
  if (ed.deleted) {
    return null;
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      score_max: ed.score_max,
      data: ed.data.map(coerceTaskDataBatchDTO).filter(notNull),
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      score_max: ed.score_max,
      data: ed.data.map(coerceTaskDataBatchDTO).filter(notNull),
    };
  }
}

function coerceTaskDataBatchDTO(ed: TaskDataED): TaskDataBatchDTO | null {
  if (ed.deleted) {
    return null;
  } else if (ed.input_file == null || ed.input_file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  } else if (ed.judge_file == null || ed.judge_file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      input_file_name: ed.input_file_name as string,
      input_file_hash: ed.input_file.hash,
      judge_file_name: ed.judge_file_name,
      judge_file_hash: ed.judge_file.hash,
      is_sample: ed.is_sample,
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      input_file_name: ed.input_file_name as string,
      input_file_hash: ed.input_file.hash,
      judge_file_name: ed.judge_file_name,
      judge_file_hash: ed.judge_file.hash,
      is_sample: ed.is_sample,
    };
  }
}

function coerceTaskOutputDTO(ed: TaskED): TaskOutputDTO {
  return {
    // Common
    id: ed.id,
    slug: ed.slug,
    title: ed.title,
    description: ed.description ?? null,
    statement: ed.statement,
    is_public: true,
    score_max: ed.subtasks.reduce((acc, subtask) => acc + subtask.score_max, 0),
    credits: ed.credits.map(coerceTaskCreditDTO).filter(notNull),
    attachments: ed.attachments.map(coerceTaskAttachmentDTO).filter(notNull),
    scripts: [],
    // OutputOnly-only
    type: TaskType.OutputOnly,
    flavor: ed.flavor ?? TaskFlavor.OutputText,
    submission_size_limit_byte: null,
    checker_kind: ed.checker.kind,
    checker_file_name:
      CheckerKind.Custom === ed.checker.kind ? ed.checker.script.file_name : undefined,
    subtasks: ed.subtasks.map(coerceSubtaskOutputDTO).filter(notNull),
  };
}

function coerceSubtaskOutputDTO(ed: TaskSubtaskED): TaskSubtaskOutputDTO | null {
  if (ed.deleted) {
    return null;
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      score_max: ed.score_max,
      data: ed.data.map(coerceTaskDataOutputDTO).filter(notNull).slice(0, 1),
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      score_max: ed.score_max,
      data: ed.data.map(coerceTaskDataOutputDTO).filter(notNull).slice(0, 1),
    };
  }
}

function coerceTaskDataOutputDTO(ed: TaskDataED): TaskDataOutputDTO | null {
  if (ed.deleted) {
    return null;
  } else if (ed.judge_file == null || ed.judge_file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      judge_file_name: ed.judge_file_name,
      judge_file_hash: ed.judge_file.hash,
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      judge_file_name: ed.judge_file_name,
      judge_file_hash: ed.judge_file.hash,
    };
  }
}
