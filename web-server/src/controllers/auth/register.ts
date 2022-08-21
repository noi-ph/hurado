import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { UserError } from 'utils/Errors';
import { validatorUsername } from 'middleware/validation/users/validatorUsername';


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

    if (username) {
      const usernameErrors = validatorUsername(username);
      if (Object.keys(usernameErrors).length) { 
        err.status = 400;
        err.username = usernameErrors.username;
      } else {
        user.username = username;
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
    return next(err);
  }

};
