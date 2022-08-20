import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { UserError } from 'utils/Errors';

export const edit = async (req: Request, res: Response, next: NextFunction) => {

  const id = parseInt(req.params.id);

  const { email, username, password, school, name, country } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  const err: UserError = {};

  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      err.id = `User with ID#${id} is not found`
    }

    if (email) {
      user.email = email;
    }

    if (username) {
      try {
        user.setUsername(username);
      } catch (e) {
        if ('username' in e) {
          err.username = e.username;
        } else {
          err.raw = e;
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

    if (name) {
      user.name = name;
    }

    if (country) {
      user.country = country;
    }

    if (!Object.keys(err).length) {
      await userRepository.save(user);
      res.customSuccess(200, 'User profile successfully edited', user);
    } else {
      return next(err);
    }
  } catch (e) {
    err.raw = e;
    return next(err);
  }
};
