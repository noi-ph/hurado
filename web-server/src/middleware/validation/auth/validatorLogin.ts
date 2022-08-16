import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/errorTypes';

export const validatorLogin = (req: Request, res: Response, next: NextFunction) => {
  let { email, password } = req.body;
  const errors = new ErrorArray();

  email = !email ? '' : email;
  password = !password ? '' : password;

  if (!validator.isEmail(email)) {
    errors.put('email', `Email '${email}' is invalid`);
  }

  if (validator.isEmpty(email)) {
    errors.put('email', `Email field is required`);
  }

  if (validator.isEmpty(password)) {
    errors.put('password', `Passwords is required`);
  }

  if (errors.isEmpty) {
    return next();
  } else {
    const customError = new CustomError(400, 'Validation', 'Login validation error', null, errors);
    return next(customError);
  }
};
