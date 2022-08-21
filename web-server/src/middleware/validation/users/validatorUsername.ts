import { UserError } from 'utils/Errors';

export const validatorUsername = (username: string) => {

    const allowedCharacters = /^[A-Za-z0-9\.\-\_]*$/;
    const hasAlphanumeric = /[A-Za-z0-9]/;
    
    const err: UserError = {};

    if (!username.match(allowedCharacters)) {
      err.username = `Username "${username}" has invalid characters`;
    }

    if (!username.match(hasAlphanumeric)) {
      err.username = `Username "${username}" must have an alphanumeric character`;
    }

    if (username.length < 3) {
      err.username = `Username "${username}" is too short`;
    }

    return err;
}