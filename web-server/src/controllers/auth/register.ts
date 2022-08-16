import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { RegisterError } from 'utils/response/custom-error/errorTypes';
import { Error } from 'middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {

  const error: Error<RegisterError> = {status: null, data: {}};

  const { email, username, password, passwordConfirm } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  
  try {
    let user = await userRepository.findOne({ where: { email } });

    if (user) { //Error 1: "email is already used" 
      error.status = 400;
      error.data.email = `User with email ${email} already exists.`;
      return next(error);
    }

    user = await userRepository.findOne({ where: { username } });

    if (user) { //Error 2: "username is already used" 
      error.status = 400;
      error.data.username = `User with username ${username} already exists.`;
      return next(error);
    }

    if (password!=passwordConfirm) { //Error 3: "password confirmation does not match password"
      error.status = 400;
      error.data.password = `Password confirmation does not match password.`;
      return next(error);
    }

    try {
      user = new User();
      user.email = email;

      try {
        user.setUsername(username);
      } catch (err: unknown) {
        res.status(400);
        error.status = 400;
        error.data.username = `Username ${username} cannot be used.`; //Error 4: 
        return next(error);
      }

      user.hashedPassword = password;
      user.hashPassword();

      if (error.status == null) { //Success: New USER is successfully created
        await userRepository.save(user);
        res.customSuccess(200, 'User successfully created.');
        res.status(200);
        error.status = 200;
      } else {
        res.status(400);
        error.status = 400;
        error.data.misc = `User cannot be created.`;
        return next(error);
      }

    } catch (err) {
      res.status(400);
      error.status = 400;
      error.data.misc = `User cannot be created.`;
      return next(error);
    }
  } catch (err) {
    res.status(400);
    error.status = 400;
    error.data.misc = `User cannot be created.`;
    return next(error);
  }

  // console.log(error.data);
};
