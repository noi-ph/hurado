import { AxiosResponse } from "axios";
import http from "client/http";
import { notNull } from "common/utils/guards";
import {
  TaskAttachmentDTO,
  TaskCreditDTO,
  TaskDataDTO,
  TaskDTO,
  TaskSubtaskDTO,
} from "common/validation/task_validation";
import { FileHashesResponse, FileUploadResponse } from "common/types/files";
import {
  EditorKind,
  TaskAttachmentED,
  TaskCreditED,
  TaskED,
  TaskFileED,
  TaskFileLocal,
  TaskFileSaved,
  TaskSubtaskED,
  TaskDataED,
} from "./types";
import { APIPath, getAPIPath } from "client/paths";


export class IncompleteHashesException extends Error {
  constructor() {
    super("Not all hashes have completed hashing");
  }
}

export class UnsavedFileException extends Error {
  constructor() {
    super("Tried saving task with unsaved file");
  }
}

export async function saveTask(task: TaskED): Promise<TaskED> {
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
  const response = await http.put(taskUpdateURL, dto);
  return response.data;
}

function extractLocalFiles(task: TaskED): TaskFileLocal[] {
  const result: TaskFileLocal[] = [];
  function maybeAddFile(file: TaskFileED | null) {
    if (file != null && file.kind === EditorKind.Local) {
      result.push(file);
    }
  }

  for (const attachment of task.attachments) {
    maybeAddFile(attachment.file);
  }

  for (const subtask of task.subtasks) {
    for (const data of subtask.data) {
      maybeAddFile(data.input_file);
      maybeAddFile(data.output_file);
      maybeAddFile(data.judge_file);
    }
  }

  return result;
}

function applySavedFileChanges(ed: TaskED, changes: TaskFileSaveResult[]): TaskED {
  function maybeReplaceFile(file: TaskFileED | null): TaskFileSaved | null {
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
              input_file: maybeReplaceFile(data.input_file),
              output_file: maybeReplaceFile(data.output_file),
              judge_file: maybeReplaceFile(data.judge_file),
            };
          }),
      };
    }),
  };
}

type TaskFileSaveResult = {
  local: TaskFileLocal;
  saved: TaskFileSaved;
};

function saveLocalFiles(
  locals: TaskFileLocal[],
  savedHashes: Set<string>
): Promise<TaskFileSaveResult>[] {
  return locals.map((local) => {
    if (savedHashes.has(local.hash)) {
      return Promise.resolve<TaskFileSaveResult>({
        local,
        saved: {
          kind: EditorKind.Saved,
          hash: local.hash,
        },
      });
    } else {
      return new Promise<TaskFileSaveResult>(async (resolve, reject) => {
        try {
          const saved = await saveLocalFileSingle(local);
          resolve({ local, saved });
        } catch (e) {
          reject(e);
        }
      });
    }
  });
}

async function getExistingHashes(locals: TaskFileLocal[]): Promise<string[]> {
  const localHashes = locals.map((f) => f.hash);
  const fileHashesURL = getAPIPath({ kind: APIPath.FileHashes });
  const response: AxiosResponse<FileHashesResponse> = await http.post(fileHashesURL, localHashes, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data.saved;
}

async function saveLocalFileSingle(local: TaskFileLocal): Promise<TaskFileSaved> {
  const fileUploadURL = getAPIPath({ kind: APIPath.FileUpload });
  const response: AxiosResponse<FileUploadResponse> = await http.post(fileUploadURL, local.file);

  return {
    kind: EditorKind.Saved,
    hash: response.data.hash,
  };
}

function coerceTaskDTO(ed: TaskED): TaskDTO {
  const locals = extractLocalFiles(ed);
  if (locals.length > 0) {
    throw new UnsavedFileException();
  }

  const dto: TaskDTO = {
    id: ed.id,
    slug: ed.slug,
    title: ed.title,
    description: ed.description ?? null,
    score_max: ed.subtasks.reduce((acc, subtask) => acc + subtask.score_max, 0),
    statement: ed.statement,
    checker: ed.checker,
    credits: ed.credits.map(coerceTaskCreditDTO).filter(notNull),
    attachments: ed.attachments.map(coerceTaskAttachmentDTO).filter(notNull),
    subtasks: ed.subtasks.map(coerceSubtaskDTO).filter(notNull),
  };

  dto.credits.forEach((credit, creditIndex) => {
    credit.order = creditIndex;
  });

  dto.subtasks.forEach((subtask, subtaskIndex) => {
    subtask.order = subtaskIndex;
    subtask.data.forEach((data, dataIndex) => {
      data.order = dataIndex;
    });
  });
  return dto;
}

function coerceTaskCreditDTO(ed: TaskCreditED, idx: number): TaskCreditDTO | null {
  if (ed.deleted) {
    return null;
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      role: ed.role,
      order: idx,
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      role: ed.role,
      order: idx,
    };
  }
}

function coerceTaskAttachmentDTO(ed: TaskAttachmentED): TaskAttachmentDTO | null {
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

function coerceSubtaskDTO(ed: TaskSubtaskED, index: number): TaskSubtaskDTO | null {
  if (ed.deleted) {
    return null;
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      order: index,
      score_max: ed.score_max,
      data: ed.data.map(coerceTaskDataDTO).filter(notNull),
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      order: index,
      score_max: ed.score_max,
      data: ed.data.map(coerceTaskDataDTO).filter(notNull),
    };
  }
}

function coerceTaskDataDTO(ed: TaskDataED, index: number): TaskDataDTO | null {
  if (ed.deleted) {
    return null;
  } else if (ed.input_file == null || ed.input_file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  } else if (ed.output_file == null || ed.output_file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  } else if (ed.judge_file != null && ed.judge_file.kind === EditorKind.Local) {
    throw new UnsavedFileException();
  }

  if (ed.kind == EditorKind.Local) {
    return {
      name: ed.name,
      order: index,
      input_file_name: ed.input_file_name,
      input_file_hash: ed.input_file.hash,
      output_file_name: ed.output_file_name,
      output_file_hash: ed.output_file.hash,
      judge_file_name: ed.judge_file != null ? ed.judge_file_name ?? "" : null,
      judge_file_hash: ed.judge_file != null ? ed.judge_file.hash : null,
      is_sample: ed.is_sample,
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      order: index,
      input_file_name: ed.input_file_name,
      input_file_hash: ed.input_file.hash,
      output_file_name: ed.output_file_name,
      output_file_hash: ed.output_file.hash,
      judge_file_name: ed.judge_file != null ? ed.judge_file_name ?? "" : null,
      judge_file_hash: ed.judge_file != null ? ed.judge_file.hash : null,
      is_sample: ed.is_sample,
    };
  }
}
