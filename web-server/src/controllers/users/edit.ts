import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { Countries } from '../../orm/entities/users/types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const {
    id,
    email,
    username,
    password,
    passwordConfirm,
    // newIsAdmin,
    school,
    firstName,
    lastName,
    country,
  } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Not Found', [`User ${id} not found`]);
      return next(customError);
    }

    if (email) {
      if (!validator.isEmail(email)) {
        const customError = new CustomError(400, 'Validation', 'Email is invalid');
        return next(customError);
      }

      const otherUser = await userRepository.findOne({ where: { email: email } });
      if (otherUser) {
        const customError = new CustomError(400, 'Validation', 'User already exists', [
          `User with email ${email} already exists`,
        ]);
        return next(customError);
      }

      user.email = email;
    }

    if (username) {
      if (!username.match(/^([a-z0-9]|[-._](?![-._])){3,20}$/)) {
        const customError = new CustomError(400, 'Validation', 'Invalid username', [
          `${username} is an invalid username`,
        ]);
        return next(customError);
      }

      const otherUser = await userRepository.findOne({ where: { username: username } });

      if (otherUser) {
        const customError = new CustomError(400, 'Validation', 'User already exists', [
          `User with username ${username} already exists`,
        ]);
        return next(customError);
      }

      user.username = username;
    }

    if (password) {
      if (password != passwordConfirm) {
        const customError = new CustomError(400, 'Validation', 'Passwords do not match', ['Passwords do not match']);
        return next(customError);
      }

      user.hashedPassword = password;
      user.hashPassword();
    }

    /*
    if (newIsAdmin != null) { // newIsAdmin might be false
      user.isAdmin = newIsAdmin;
    }
    */

    if (school) {
      user.school = school;
    }

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    if (country) {
      if (!(country in Countries)) {
        const customError = new CustomError(400, 'Validation', 'Invalid country', [
          `Country ${country} is not recognised`,
        ]);
        return next(customError);
      }

      user.country = country;
    }

    userRepository.save(user);

    res.customSuccess(200, 'Password successfully changed.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
