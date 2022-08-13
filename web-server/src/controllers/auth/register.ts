import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const { email, username, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  try {
    let user = await userRepository.findOne({ where: { email } });

    if (user) {
      errors.put('email', `User with email ${email} already exists`);
    }

    user = await userRepository.findOne({ where: { username } });

    if (user) {
      errors.put('username', `User with username ${username} already exists`);
    }

    try {
      user = new User();
      user.email = email;

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

      user.hashedPassword = password;
      user.hashPassword();

      if (errors.isEmpty) {
        await userRepository.save(user);
        res.customSuccess(200, 'User successfully created.');
      } else {
        const customError = new CustomError(400, 'Validation', 'User vannot be created', null, errors);
        return next(customError);
      }
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `User cannot be created`, err, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
