import validator from 'validator';

import { ScriptPayload } from "controllers/tasks/helpers/payloads";
import { ScriptError } from "utils/Errors";

import { validateFilePayload } from '../files/validatePayload';

export const validateScriptPayload = (data: ScriptPayload) => {
  let { file, languageCode, runtimeArgs } = data;

  languageCode = languageCode ? languageCode : '';
  runtimeArgs = runtimeArgs ? runtimeArgs : '';

  const err: ScriptError = {};

  if (validator.isEmpty(languageCode)) {
    err.languageCode = 'Code language field is requried';
  }

  if (validator.isEmpty(runtimeArgs)) {
    err.runtimeArgs = 'Runtime arguments field is required';
  }

  const fileError = validateFilePayload(file);
  if (Object.keys(fileError).length) {
    err.file = fileError;
  }

  return err;
}