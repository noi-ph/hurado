import { Language } from "common/types/constants";
import { EditorKind } from "../common_editor";
import { TaskScriptED } from "./types";

export function createEmptyScript(): TaskScriptED {
  return {
    kind: EditorKind.Local,
    language: Language.Python3,
    file: null,
    file_name: "",
    argv: [],
  };
}
