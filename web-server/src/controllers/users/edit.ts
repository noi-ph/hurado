import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);
  const { email, username, password, school, firstName, lastName, country } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      errors.put('user', `User with id ${id} not found`);
    }

    if (email) {
      user.email = email;
    }

    if (username) {
      try {
        user.setUsername(username);
      } catch (err: unknown) {
        if (err instanceof CustomError) {
          errors.extend(err.JSON.errors);
        } else {
          const customError = new CustomError(400, 'Raw', 'Error', err, errors);
          return next(customError);
        }
      }
    }

    if (password) {
      user.hashedPassword = password;
      user.hashPassword();
    }

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
      user.country = country;
    }

    if (errors.isEmpty) {
      await userRepository.save(user);
      res.customSuccess(200, 'User profile successfully edited', user);
    } else {
      const customError = new CustomError(400, 'Validation', 'Unable to edit user data', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
