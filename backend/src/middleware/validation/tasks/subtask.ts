import validator from "validator";

import { ServerAPI } from "types";
import { validateScriptPayload } from "../scripts";

export const validateSubtask = (subtask: ServerAPI['SubtaskPayload'], scorerScriptFile: Express.Multer.File, validatorScriptFile: Express.Multer.File) => {
  const err: ServerAPI['SubtaskError'] = {};

  if (validator.isEmpty(subtask.name)) {
    err.name = 'This field is required';
  }

  if (Number.isNaN(subtask.order)) {
    err.order = 'Order must be a number';
  }

  if (Number.isNaN(subtask.scoreMax) || subtask.scoreMax < 0) {
    err.scoreMax = 'Maximum score must be nonnegative';
  }

  const scorerError = validateScriptPayload(subtask.scorerScript, scorerScriptFile);
  if (Object.keys(scorerError).length) {
    err.scorerScript = scorerError;
  }

  const validatorError = validateScriptPayload(subtask.validatorScript, validatorScriptFile);
  if (Object.keys(validatorError).length) {
    err.validatorScript = validatorError;
  }

  if (!subtask.testDataPattern) {
    err.testDataPattern = 'This field is required';
  }

  return err;
};
