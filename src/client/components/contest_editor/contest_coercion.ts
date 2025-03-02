import {
  ContestAttachmentEditorDTO,
  ContestEditorDTO,
  ContestTaskEditorDTO,
} from "common/validation/contest_validation";
import { CommonAttachmentED, EditorKind } from "../common_editor";
import { ContestED, ContestTaskED } from "./types";

export function coerceContestED(dto: ContestEditorDTO): ContestED {
  const contest: ContestED = {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description,
    statement: dto.statement,
    start_time: dto.start_time,
    end_time: dto.end_time,
    attachments: dto.attachments.map((x) => coerceContestAttachmentED(x)),
    tasks: dto.tasks.map((x) => coerceContestTaskED(x)),
    is_public: dto.is_public,
  };
  return contest;
}

function coerceContestAttachmentED(dto: ContestAttachmentEditorDTO): CommonAttachmentED {
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

function coerceContestTaskED(dto: ContestTaskEditorDTO): ContestTaskED {
  return {
    task: {
      id: dto.task_id,
      slug: dto.slug,
      title: dto.title,  
    },
    score_max: dto.score_max,
    letter: dto.letter,
    deleted: false,
  };
}
