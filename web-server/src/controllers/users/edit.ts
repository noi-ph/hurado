import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { UserError } from 'utils/Errors';
import { validatorUsername } from 'middleware/validation/users/validatorUsername';

export const edit = async (req: Request, res: Response, next: NextFunction) => {

  const id = parseInt(req.params.id);

  const { email, username, password, school, name, country } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  const err: UserError = {};

  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      err.status = 404;
      err.id = `User with ID#${id} is not found`
    }

    if (email) {
      user.email = email;
    }

    if (username) {
      const usernameErrors = validatorUsername(username);
      if (Object.keys(usernameErrors).length) { 
        err.status = 400;
        err.username = usernameErrors.username;
      } else {
        user.username = username;
      }
    }

    if (password) {
      user.setPassword(password);
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
    err.status = 500;
    return next(err);
  }
};
