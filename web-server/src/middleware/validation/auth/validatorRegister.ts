import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from 'consts/ConstsUser';
import { UserError } from 'utils/Errors';

export const validatorRegister = (req: Request, res: Response, next: NextFunction) => {
  let { email, username, password, passwordConfirm } = req.body;

  email = !email ? '' : email;
  username = !username ? '' : username;
  password = !password ? '' : password;
  passwordConfirm = !passwordConfirm ? '' : passwordConfirm;

  const err: UserError = {};

  if (validator.isEmpty(email)) {
    err.email = 'Email field is required';
    return next(err);
  }

  if (!validator.isEmail(email)) {
    err.email = `Email ${email} is invalid`;
    return next(err);
  }

  if (validator.isEmpty(username)) {
    err.username = 'Username field is required';
    return next(err);
  }

  if (validator.isEmpty(password)) {
    err.password = 'Pasword field is required';
    return next(err);
  }

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    err.password = `Password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`;
    return next(err);
  }

  if (validator.isEmpty(passwordConfirm)) {
    err.passwordConfirm = 'Password confirmation field is required';
    return next(err);
  }

  if (!validator.equals(password, passwordConfirm)) {
    err.password = 'Password does not match password confimation';
    err.passwordConfirm = 'Password confirmation does not match password';
    return next(err);
  }

  return next();
};
