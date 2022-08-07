import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

import { Countries } from '../../orm/entities/users/types';

export const changeGeneral = async (req: Request, res: Response, next: NextFunction) => {
  const {
    id,
    username,
    password,
    newEmail,
    newUsername,
    newPassword,
    newPasswordConfirm,
    // newIsAdmin,
    newSchool,
    newFirstName,
    newLastName,
    newCountry,
  } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Not Found', [`User ${username} not found`]);
      return next(customError);
    }

    if (!user.checkIfPasswordMatch(password)) {
      const customError = new CustomError(400, 'General', 'Not Found', ['Incorrect password']);
      return next(customError);
    }

    if (newEmail) {
      if (!validator.isEmail(newEmail)) {
        const customError = new CustomError(400, 'Validation', 'Email is invalid');
        return next(customError);
      }

      const otherUser = await userRepository.findOne({ where: { email: newEmail } });
      if (otherUser) {
        const customError = new CustomError(400, 'Validation', 'User already exists', [
          `User with email ${newEmail} already exists`,
        ]);
        return next(customError);
      }

      user.email = newEmail;
    }

    if (newUsername) {
      if (!newUsername.match(/^([a-z0-9]|[-._](?![-._])){3,20}$/)) {
        const customError = new CustomError(400, 'Validation', 'Invalid username', [
          `${newUsername} is an invalid username`,
        ]);
        return next(customError);
      }

      const otherUser = await userRepository.findOne({ where: { username: newUsername } });

      if (otherUser) {
        const customError = new CustomError(400, 'Validation', 'User already exists', [
          `User with username ${newUsername} already exists`,
        ]);
        return next(customError);
      }

      user.username = newUsername;
    }

    if (newPassword) {
      if (newPassword != newPasswordConfirm) {
        const customError = new CustomError(400, 'Validation', 'Passwords do not match', ['Passwords do not match']);
        return next(customError);
      }

      user.hashedPassword = newPassword;
      user.hashPassword();
    }

    /*
    if (newIsAdmin != null) { // newIsAdmin might be false
      user.isAdmin = newIsAdmin;
    }
    */

    if (newSchool) {
      user.school = newSchool;
    }

    if (newFirstName) {
      user.firstName = newFirstName;
    }

    if (newLastName) {
      user.lastName = newLastName;
    }

    if (newCountry) {
      if (!(newCountry in Countries)) {
        const customError = new CustomError(400, 'Validation', 'Invalid country', [
          `Country ${newCountry} is not recognised`,
        ]);
        return next(customError);
      }

      user.country = newCountry;
    }

    userRepository.save(user);

    res.customSuccess(200, 'Password successfully changed.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
