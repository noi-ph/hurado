import { AxiosResponse } from "axios";
import http from "client/http";
import { notNull } from "common/utils/guards";
import {
  ContestEditorDTO,
  ContestUpdateDTO,
  ContestAttachmentUpdateDTO,
  ContestTaskUpdateDTO,
} from "common/validation/contest_validation";
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
import { coerceContestED } from "./contest_coercion";
import { ContestED, ContestTaskED } from "./types";

export async function saveContest(contest: ContestED): Promise<SaveResult<ContestED>> {
  const errors = validateContest(contest);
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const unsavedFiles = extractLocalFiles(contest);
  for (const unsaved of unsavedFiles) {
    if (unsaved.hash == "") {
      throw new IncompleteHashesException();
    }
  }

  const savedHashesList = await getExistingHashes(unsavedFiles);
  const savedHashes = new Set(savedHashesList);
  const savedFiles = await Promise.all(saveLocalFiles(unsavedFiles, savedHashes));
  const updatedContest = applySavedFileChanges(contest, savedFiles);
  const dto = coerceContestUpdateDTO(updatedContest);
  const contestUpdateURL = getAPIPath({ kind: APIPath.ContestUpdate, id: contest.id });
  const response: AxiosResponse<ContestEditorDTO> = await http.put(contestUpdateURL, dto);
  return {
    success: true,
    value: coerceContestED(response.data),
  };
}

function validateContest(contest: ContestED): string[] {
  return [];
}

function extractLocalFiles(contest: ContestED): CommonFileLocal[] {
  const result: CommonFileLocal[] = [];
  function maybeAddFile(file: CommonFileED | null) {
    if (file != null && file.kind === EditorKind.Local) {
      result.push(file);
    }
  }

  for (const attachment of contest.attachments) {
    maybeAddFile(attachment.file);
  }

  return result;
}

function applySavedFileChanges(ed: ContestED, changes: CommonFileSaveResult[]): ContestED {
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
  };
}

function coerceContestUpdateDTO(ed: ContestED): ContestUpdateDTO {
  const locals = extractLocalFiles(ed);
  if (locals.length > 0) {
    throw new UnsavedFileException();
  }

  return {
    id: ed.id,
    slug: ed.slug,
    title: ed.title,
    description: ed.description,
    statement: ed.statement,
    is_public: ed.is_public,
    start_time: ed.start_time ?? null,
    end_time: ed.end_time ?? null,
    attachments: ed.attachments.map(coerceContestAttachmentUpdateDTO).filter(notNull),
    tasks: ed.tasks.map(coerceContestTaskDTO).filter(notNull),
  };
}

function coerceContestAttachmentUpdateDTO(
  ed: CommonAttachmentED
): ContestAttachmentUpdateDTO | null {
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

function coerceContestTaskDTO(ed: ContestTaskED): ContestTaskUpdateDTO | null {
  if (ed.deleted || ed.task == null) {
    return null;
  }

  return {
    task_id: ed.task.id,
    letter: ed.letter,
    score_max: ed.score_max,
  };
}
