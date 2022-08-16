import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from 'consts/ConstsUser';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { RegisterError, ErrorArray } from 'utils/response/custom-error/errorTypes';
import { Error } from 'middleware/errorHandler';


export const validatorRegister = (req: Request, res: Response, next: NextFunction) => {
  let { email, username, password, passwordConfirm } = req.body;
  const errors = new ErrorArray();

  email = !email ? '' : email;
  username = !username ? '' : username;
  password = !password ? '' : password;
  passwordConfirm = !passwordConfirm ? '' : passwordConfirm;

  if (!validator.isEmail(email)) {
    errors.put('email', `Email '${email}' is invalid`);
  }

  if (validator.isEmpty(email)) {
    errors.put('email', `Email field is required`);
  }

  if (validator.isEmpty(username)) {
    errors.put('username', `Username field is required`);
  }

  if (validator.isEmpty(password)) {
    errors.put('password', `Passwords is required`);
  }

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errors.put('password', `Password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`);
  }

  if (validator.isEmpty(passwordConfirm)) {
    errors.put('password', `Passwords confirmation is required`);
  }

  if (!validator.equals(password, passwordConfirm)) {
    errors.put('password', `Passwords do not match`);
  }

  if (errors.isEmpty) {
    return next();
  } else {
    
    const customError = new CustomError(400, 'Validation', 'Register validation error', null, errors);
    return next(customError);
  }
};
