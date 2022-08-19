import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { UserError } from 'utils/Errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  
  const err: UserError = {};

  try {
    let user = await userRepository.findOne({ where: { email } });

    if (user) {
      err.email = `User with email ${email} already exists`
    }

    user = await userRepository.findOne({ where: { username } });

    if (user) {
      err.username = `User with username ${username} already exists`;
    }

    user = new User();
    user.email = email;

    try {
      user.setUsername(username);
    } catch (e) {
      if ('username' in e) {
        err.username = e.username;
      } else {
        err.raw = e;
      }
    }

    user.hashedPassword = password;
    user.hashPassword();

    if (Object.keys(err).length) {
      return next(err);
    } else {
      userRepository.create(user);
      res.status(200);
      res.send(user);
    }
  } catch (e) {
    err.raw = e;
    return next(err);
  }

  // console.log(error.data);
};
