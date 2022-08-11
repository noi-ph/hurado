import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
  const { email, username, password, passwordConfirm, school, firstName, lastName, country } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Not Found', [`User ${id} not found`]);
      return next(customError);
    }

    if (email) {
      user.email = email;
    }

    if (username) {
      try {
        user.setUsername(username);
      } catch (err: unknown) {
        if (err instanceof CustomError) {
          return next(err);
        } else {
          const customError = new CustomError(400, 'Raw', 'Error', null, err);
          return next(customError);
        }
      }
    }

    if (password) {
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
      user.country = country;
    }

    userRepository.save(user);

    res.customSuccess(200, 'User profile successfully edited.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
