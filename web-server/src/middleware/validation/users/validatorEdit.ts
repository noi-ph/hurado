import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { Countries } from '../../../orm/entities/users/types';
import { UserError } from 'utils/Errors';

export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { email, username, password, passwordConfirm, school, name, country } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  email = !email ? '' : email;
  username = !username ? '' : username;
  password = !password ? '' : password;
  passwordConfirm = !passwordConfirm ? '' : passwordConfirm;
  school = !school ? '' : school;
  name = !name ? '' : name;
  country = !country ? '' : country;

  const err: UserError = {};

  if (email) {
    const user = await userRepository.findOne({ where: { email } });
    if (user) {
      err.email = `Email "${email}" already exists`;
    }

    if (!validator.isEmail(email)) {
      err.email = `Email "${email}" is invalid`;
    }
  }

  if (username) {
    const user = await userRepository.findOne({ where: { username } });
    if (user) {
      err.username = `Username "${username} already exists"`;
    }
  }

  if (password) {
    if (password != passwordConfirm) {
      err.password = `Password does not match password confirmation`;
      err.passwordConfirm = `Password confirmation does not match password`;
    }
  }

  if (country) {
    if (!(country in Countries)) {
      err.country = `Country "${country}" is not recognized`;
    }
  }

  if (Object.keys(err).length) {
    err.status = 400;
    return next(err);
  } else return next();
};
