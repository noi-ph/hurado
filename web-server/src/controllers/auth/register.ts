import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { UserError } from 'utils/Errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password, passwordConfirm } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  
  const err: UserError = {};

  try {

    let user = await userRepository.findOne({ where: { email } });

    if (user) {
      err.status = 400;
      err.email = `User with email "${email}" already exists`
    }

    user = await userRepository.findOne({ where: { username } });

    if (user) {
      err.status = 400;
      err.username = `User with username "${username}" already exists`;
    }

    user = new User();
    user.email = email;

    try {
      user.setUsername(username);
    } catch (e) {
      if ('username' in e) {
        err.status = 400;
        err.username = e.username;
      } else {
        err.status = 500;
        err.raw = 'Internal server error';
      }
    }

    user.setPassword(password);

    if (Object.keys(err).length) {
      return next(err);
    } else {
      await userRepository.save(user);
      res.status(200);
      res.send(user);
    }
  } catch (e) {
    err.status = 500;
    err.raw = 'Internal server error';
    return next(err);
  }

  // console.log(error.data);
};
