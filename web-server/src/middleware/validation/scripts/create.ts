import validator from "validator";

import { ServerAPI } from "types";

export const validateScriptPayload = (script: ServerAPI['ScriptPayload'], file: Express.Multer.File | null) => {
  const err: ServerAPI['ScriptError'] = {};

  if (!file) {
    err.file.contents = 'This field is required';
  }

  if (validator.isEmpty(script.languageCode)) {
    err.languageCode = 'This field is required';
  }

  if (validator.isEmpty(script.runtimeArgs)) {
    err.runtimeArgs = 'This field is required';
  }

  return err;
};