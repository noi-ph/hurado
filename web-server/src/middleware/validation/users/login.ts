import validator from "validator";
import { Request, Response, NextFunction } from "express";

import { ServerAPI } from "types";
import { AppDataSource } from "orm/data-source";
import { User } from "orm/entities";

export const validationLogin = async (req: Request, res: Response, next: NextFunction) => {
  let { email, password } = req.body as ServerAPI['LoginPayload'];

  email = email ? email : '';
  password = password ? password : '';

  const userRepository = AppDataSource.getRepository(User);
  const err: ServerAPI['UserError'] = {};

  if (validator.isEmpty(email)) {
    err.email = 'This field is required';
    res.status(400).json(err);
    return;
  }

  if (validator.isEmpty(password)) {
    err.password = 'This field is required';
    res.status(400).json(err);
    return;
  }

  try {
    const user = await userRepository.findOne({ where: { email } });

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
