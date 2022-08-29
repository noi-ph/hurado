import validator from "validator";
import { Request, Response, NextFunction } from "express";

import { ServerAPI } from "types";
import { UserConstants } from "consts/User";
import { validateUsername } from "./username";
import { UserRepository } from "orm/repositories";

export const validationRegister = async (req: Request, res: Response, next: NextFunction) => {
  let { email, username, password, passwordConfirm } = req.body as ServerAPI['RegisterPayload'];

  email = email ? email : '';
  username = username ? username : '';
  password = password ? password : '';
  passwordConfirm = passwordConfirm ? passwordConfirm : '';

  const err: ServerAPI['UserError'] = {};

  if (validator.isEmpty(email)) {
    err.email = 'This field is required';
  } else if (!validator.isEmail(email)) {
    err.email = 'That e-mail address is invalid';
  } else {
    const user = await UserRepository.findOne({ where: { email } });
    if (user) {
      err.email = 'That e-mail address is already registered';
    }
  }

  if (validator.isEmpty(username)) {
    err.username = 'This field is required';
  } else {
    const usernameError = validateUsername(username);
    if (Object.keys(usernameError).length) {
      err.username = usernameError.username;
    } else {
      const user = await UserRepository.findOne({ where: { username } });
      if (user) {
        err.username = 'That username is already taken';
      }
    }
  }

  if (validator.isEmpty(password)) {
    err.password = 'This field is required';
  } else if (!validator.isLength(password, { min: UserConstants.passwordMinChar })) {
    err.password = 'Password is too short';
  }

  if (validator.isEmpty(passwordConfirm)) {
    err.passwordConfirm = 'This field is required';
  }

  if (!validator.isEmpty(password) && !validator.isEmpty(passwordConfirm) && password !== passwordConfirm) {
    err.passwordConfirm = 'Passwords do not match';
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    return next();
  }
};
