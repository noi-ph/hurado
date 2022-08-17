import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { UserError } from 'utils/Errors';

export const validatorLogin = (req: Request, res: Response, next: NextFunction) => {
  let { email, password } = req.body;

  email = !email ? '' : email;
  password = !password ? '' : password;

  const err: UserError = {};

  if (validator.isEmpty(email)) {
    err.email = 'Email field is required';
  }

  if (!validator.isEmail(email)) {
    err.email = `Email ${email} is invalid`;
  }

  if (validator.isEmpty(password)) {
    err.password = 'Password field is required';
  }

  if (Object.keys(err).length) {
    return next(err);
  } else {
    return next();
  }
};
