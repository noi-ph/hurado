import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { UserError } from 'utils/Errors';

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  const userRepository = AppDataSource.getRepository(User);

  const err: UserError = {};

  try {
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: ['id', 'username', 'email', 'isAdmin', 'country', 'createdAt', 'name', 'school'],
    });

    if (!user) {
      err.status = 404;
    }

    if (Object.keys(err).length) {
      return next(err);
    } else {
      res.customSuccess(200, 'User found', user);
    }
  } catch (e) {
    err.status = 500;
    return next(err);
  }
};
