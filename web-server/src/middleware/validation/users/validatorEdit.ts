import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

import { Countries } from '../../../orm/entities/users/types';

export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { email, username, password, passwordConfirm, school, firstName, lastName, country } = req.body;
  const errors = new ErrorArray();
  const userRepository = AppDataSource.getRepository(User);

  email = !email ? '' : email;
  username = !username ? '' : username;
  password = !password ? '' : password;
  passwordConfirm = !passwordConfirm ? '' : passwordConfirm;
  school = !school ? '' : school;
  firstName = !firstName ? '' : firstName;
  lastName = !lastName ? '' : lastName;
  country = !country ? '' : country;

  if (email) {
    const user = await userRepository.findOne({ where: { email } });
    if (user) {
      errors.put('email', `Email '${email}' already exists`);
    }

    if (!validator.isEmail(email)) {
      errors.put('email', `Email '${email}' is invalid`);
    }
  }

  if (username) {
    const user = await userRepository.findOne({ where: { username } });
    if (user) {
      errors.put('username', `Username '${username}' already exists`);
    }
  }

  if (password) {
    if (password != passwordConfirm) {
      errors.put('password', `Passwords do not match`);
    }
  }

  if (country) {
    if (!(country in Countries)) {
      errors.put('country', `Country '${country}' is not recognized`);
    }
  }

  if (!errors.isEmpty) {
    const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, errors);
    return next(customError);
  }
  return next();
};
