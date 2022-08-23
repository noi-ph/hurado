import validator from "validator";

import { FilePayload } from "utils/payloads";
import { FileError } from "utils/Errors";

export const validateFilePayload = (data: FilePayload) => {
  let { name, file } = data;

  name = name ? name : '';

  const err: FileError = {};

  if (validator.isEmpty(name)) {
    err.name = 'File name field is required';
  }

  if (!file) {
    err.file = 'File field is required';
  }

  return err;
}