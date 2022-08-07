import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  try {
    let user = await userRepository.findOne({ where: { email } });

    if (user) {
      const customError = new CustomError(400, 'General', 'User already exists', [
        `Email '${user.email}' already exists`,
      ]);
      return next(customError);
    }

    user = await userRepository.findOne({ where: { username } });

    if (user) {
      const customError = new CustomError(400, 'General', 'User already exists', [
        `Username '${user.username}' already exists`,
      ]);
      return next(customError);
    }

    try {
      const newUser = new User();
      newUser.email = email;
      newUser.username = username;
      newUser.hashedPassword = password;
      newUser.hashPassword();
      await userRepository.save(newUser);

      res.customSuccess(200, 'User successfully created.');
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `User '${email}' can't be created`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
