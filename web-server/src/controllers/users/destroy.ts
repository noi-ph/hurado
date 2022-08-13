import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = req.params.id;

  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id: +id } });

    if (!user) {
      errors.put('user', `User with id ${id} not found`);
    }

    if (errors.isEmpty) {
      userRepository.delete(id);
      res.customSuccess(200, 'User successfully deleted');
    } else {
      const customError = new CustomError(400, 'Validation', 'Cannot delete user', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
