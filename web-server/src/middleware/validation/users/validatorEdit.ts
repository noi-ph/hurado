import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

import { Countries } from '../../../orm/entities/users/types';

export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { email, username, password, passwordConfirm, school, firstName, lastName, country } = req.body;
  const errorsValidation: ErrorValidation[] = [];
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
      errorsValidation.push({ email: `Email '${email}' already exists` });
    }

    if (!validator.isEmail(email)) {
      errorsValidation.push({ email: `Email '${email}' is invalid` });
    }
  }

  if (username) {
    const user = await userRepository.findOne({ where: { username } });
    if (user) {
      errorsValidation.push({ username: `Username '${username}' already exists` });
    }

    function validUsername(username: string) {
      const regex = /^([a-z0-9]|[-._](?![-._])){3,20}$/;
      return username.match(regex);
    }
    if (!validUsername(username)) {
      errorsValidation.push({ username: `Username '${username}' is invalid` });
    }
  }

  if (password) {
    if (password != passwordConfirm) {
      errorsValidation.push({ password: `Passwords do not match` });
    }
  }

  if (country) {
    if (!(country in Countries)) {
      errorsValidation.push({ country: `Country '${country}' is not recognized` });
    }
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
