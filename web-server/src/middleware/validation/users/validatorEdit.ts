import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorEdit = async (req: Request, res: Response, next: NextFunction) => {
  let { username, name } = req.body;
  const errorsValidation: ErrorValidation[] = [];
  const userRepository = AppDataSource.getRepository(User);

  username = !username ? '' : username;
  name = !name ? '' : name;

  const user = await userRepository.findOne({ where: { username } });
  if (user) {
    errorsValidation.push({ username: `Username '${username}' already exists` });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Edit user validation error', null, null, errorsValidation);
    return next(customError);
  }
  return next();
};
