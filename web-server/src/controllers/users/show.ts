import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = req.params.id;

  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: ['id', 'username', 'email', 'isAdmin', 'country', 'createdAt', 'firstName', 'lastName', 'school'],
    });

    if (!user) {
      errors.put('user', `User with id ${id} not found`);
    }

    if (errors.isEmpty) {
      res.customSuccess(200, 'User found', user);
    } else {
      const customError = new CustomError(400, 'Validation', 'Cannot retrieve user', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
