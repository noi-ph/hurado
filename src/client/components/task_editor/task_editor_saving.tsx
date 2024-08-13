import http from "client/http";
import {
  TaskAttachmentDTO,
  TaskCreditDTO,
  TaskDTO,
  TaskFileUploadRequest,
  TaskSubtaskDTO,
  TaskTestDataDTO,
} from "common/types";
import {
  EditorKind,
  TaskAttachmentED,
  TaskCreditED,
  TaskED,
  TaskFileED,
  TaskFileLocal,
  TaskFileSaved,
  TaskSubtaskED,
  TaskTestDataED,
} from "./types";
import { notNull } from "common/utils/guards";

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
    if (unsaved.hash == '') {
      throw new IncompleteHashesException();
    }
  }

  const savedFiles = await Promise.all(saveLocalFiles(task, unsavedFiles));
  const updatedTask = applySavedFileChanges(task, savedFiles);
  const dto = coerceTaskDTO(updatedTask);
  const response = await http.put("", dto);
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
    for (const data of subtask.test_data) {
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
    attachments: ed.attachments.map((att) => {
      return {
        ...att,
        file: maybeReplaceFile(att.file),
      };
    }),
    subtasks: ed.subtasks.map((sub) => {
      return {
        ...sub,
        test_data: sub.test_data.map((data) => {
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

function saveLocalFiles(task: TaskED, locals: TaskFileLocal[]): Promise<TaskFileSaveResult>[] {
  return locals.map((local) => {
    return new Promise(async (resolve, reject) => {
      try {
        const saved = await saveLocalFileSingle(task, local);
        resolve({ local, saved });  
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function saveLocalFileSingle(task: TaskED, local: TaskFileLocal): Promise<TaskFileSaved> {
  console.log('Trying one file', local.file);
  const response = await http.post(`/api/v1/tasks/${task.id}/files`);
  const saved: TaskFileSaved = await http.post(`/api/v1/tasks/files`, local);
  return saved;
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
    statement: ed.statement,
    checker: ed.checker,
    credits: ed.credits.map(coerceTaskCreditDTO).filter(notNull),
    attachments: ed.attachments.map(coerceTaskAttachmentDTO).filter(notNull),
    subtasks: ed.subtasks.map(coerceSubtaskDTO).filter(notNull),
  };

  dto.subtasks.forEach((subtask, subtaskIndex) => {
    subtask.order = subtaskIndex;
    subtask.test_data.forEach((data, dataIndex) => {
      data.order = dataIndex;
    });
  });
  return dto;
}

function coerceTaskCreditDTO(ed: TaskCreditED): TaskCreditDTO | null {
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
      file_id: ed.file.id,
    };
  } else {
    return {
      id: ed.id,
      path: ed.path,
      mime_type: ed.mime_type,
      file_id: ed.file.id,
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
      test_data: ed.test_data.map(coerceTestDataDTO).filter(notNull),
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      order: index,
      score_max: ed.score_max,
      test_data: ed.test_data.map(coerceTestDataDTO).filter(notNull),
    };
  }
}

function coerceTestDataDTO(ed: TaskTestDataED, index: number): TaskTestDataDTO | null {
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
      input_file_id: ed.input_file.id,
      output_file_name: ed.output_file_name,
      output_file_id: ed.output_file.id,
      judge_file_name: ed.judge_file != null ? ed.judge_file_name ?? "" : null,
      judge_file_id: ed.judge_file != null ? ed.judge_file.id : null,
      is_sample: ed.is_sample,
    };
  } else {
    return {
      id: ed.id,
      name: ed.name,
      order: index,
      input_file_name: ed.input_file_name,
      input_file_id: ed.input_file.id,
      output_file_name: ed.output_file_name,
      output_file_id: ed.output_file.id,
      judge_file_name: ed.judge_file != null ? ed.judge_file_name ?? "" : null,
      judge_file_id: ed.judge_file != null ? ed.judge_file.id : null,
      is_sample: ed.is_sample,
    };
  }
}
