import { UserConstants } from "consts/User";
import { ServerAPI } from "types";

export const validateUsername = (username: string) => {
  const err: ServerAPI['UserError'] = {};

  if (!username.match(UserConstants.allowedCharacters)) {
    err.username = 'Username has invalid characters';
  } else if (!username.match(UserConstants.hasAlphanumeric)) {
    err.username = 'Username must have an alphanumeric character';
  } else if (username.length < UserConstants.usernameMinChar) {
    err.username = 'Username is too short';
  }

  return err;
};