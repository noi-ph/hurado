import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ServerAPI } from 'types';
import { UserRepository } from 'orm/repositories';

export const validationLogin = async (req: Request, res: Response, next: NextFunction) => {
  console.log('halp!!');
  let { email, password } = req.body as ServerAPI['LoginPayload'];

  email = email ? email : '';
  password = password ? password : '';

  const err: ServerAPI['UserError'] = {};

  if (validator.isEmpty(email)) {
    err.email = 'This field is required';
  }

  if (validator.isEmpty(password)) {
    err.password = 'This field is required';
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
    return;
  }

  try {
    const user = await UserRepository.findOne({ where: { email } });

    if (!user) {
      err.email = 'User not found';
    } else if (!user.checkIfPasswordMatch(password)) {
      err.password = 'Password is incorrect';
    }

    if (Object.keys(err).length) {
      res.status(400).json(err);
    } else {
      return next();
    }
  } catch (e) {
    res.status(500).end();
  }
};
