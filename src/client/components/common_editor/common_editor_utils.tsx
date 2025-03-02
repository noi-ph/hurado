import { AxiosResponse } from "axios";
import { useCallback } from "react";
import http from "client/http";
import { APIPath, getAPIPath } from "client/paths";
import { InputChangeEvent } from "common/types/events";
import { FileHashesResponse, FileUploadResponse } from "common/types/files";
import { sha256 } from "common/utils/hashing";
import { CommonFileLocal, CommonFileSaved, EditorKind } from "./types";

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

export function useSimpleStringPropUpdater<T>(object: T, setObject: (obj: T) => void, key: string) {
  return useCallback(
    (event: InputChangeEvent) => {
      setObject({
        ...object,
        [key]: event.target.value,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
    [object, setObject]
  );
}

export async function destructivelyComputeSHA1(local: CommonFileLocal) {
  // This mutates the CommonFileLocal but that's okay. As long as we don't save before
  // all of the destructivelyComputeSHA1s complete, it's fine.
  const buffer = await local.file.arrayBuffer();
  const sha1 = await sha256(buffer);
  local.hash = sha1;
}

export type CommonFileSaveResult = {
  local: CommonFileLocal;
  saved: CommonFileSaved;
};

export function saveLocalFiles(
  locals: CommonFileLocal[],
  savedHashes: Set<string>
): Promise<CommonFileSaveResult>[] {
  return locals.map((local) => {
    if (savedHashes.has(local.hash)) {
      return Promise.resolve<CommonFileSaveResult>({
        local,
        saved: {
          kind: EditorKind.Saved,
          hash: local.hash,
        },
      });
    } else {
      // eslint-disable-next-line no-async-promise-executor -- pre-existing error before eslint inclusion
      return new Promise<CommonFileSaveResult>(async (resolve, reject) => {
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

export async function getExistingHashes(locals: CommonFileLocal[]): Promise<string[]> {
  const localHashes = locals.map((f) => f.hash);
  const fileHashesURL = getAPIPath({ kind: APIPath.FileHashes });
  const response: AxiosResponse<FileHashesResponse> = await http.post(fileHashesURL, localHashes, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data.saved;
}

async function saveLocalFileSingle(local: CommonFileLocal): Promise<CommonFileSaved> {
  const formData = new FormData();
  formData.append('file', local.file);
  const fileUploadURL = getAPIPath({ kind: APIPath.FileUpload });
  const response: AxiosResponse<FileUploadResponse> = await http.post(fileUploadURL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    kind: EditorKind.Saved,
    hash: response.data.hash,
  };
}

export function getLocationHash(): string {
  return typeof window !== "undefined" ? window.location.hash : "";
}
