import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

import { ServerAPI } from 'types';
import { validateUsername } from './username';
import { UserConstants } from 'consts/User';
import { Countries } from 'orm/entities/enums';
import { UserRepository } from 'orm/repositories';

export const validationEdit = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.jwtPayload.id;
  let { email, username, school, name, country, password, passwordConfirm } = req.body as ServerAPI['UserEditPayload'];

  email = email ? email : '';
  username = username ? username : '';
  school = school ? school : '';
  name = name ? name : '';
  country = country ? country : '';
  password = password ? password : '';
  passwordConfirm = passwordConfirm ? passwordConfirm : '';

  const user = await UserRepository.findOne({ where: { id }});
  const err: ServerAPI['UserError'] = {};

  if (!validator.isEmpty(email) && email !== user.email) {
    if (!validator.isEmail(email)) {
      err.email = 'That e-mail address is invalid';
    } else {
      const user = await UserRepository.findOne({ where: { email } });
      if (user) {
        err.email = 'That e-mail address is already registered';
      }
    }
  }

  if (!validator.isEmpty(username) && username !== user.username) {
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

  if (!validator.isEmpty(password)) {
    if (password.length < UserConstants.passwordMinChar) {
      err.password = 'Password is too short';
    } else if (validator.isEmpty(passwordConfirm)) {
      err.passwordConfirm = 'This field is required';
    } else if (password !== passwordConfirm) {
      err.passwordConfirm = 'Passwords do not match';
    }
  }

  if (!validator.isEmpty(country) && country !== user.country) {
    if (!Object.values(Countries).includes(country as Countries)) {
      err.country = 'That country is not recognized';
    }
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    return next();
  }
};
