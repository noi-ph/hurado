import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/errorTypes';

export const validatorAccess = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const taskId = parseInt(req.params.id);
  const userId = req.jwtPayload.id;

  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);

  try {
    const task = await taskRepository.findOne({ where: { id: taskId } });
    const user = await userRepository.findOne({ where: { id: userId } });

    if (task.ownerId != userId && !user.isAdmin) {
      errors.put('user', `User is neither an admin nor the owner of ${taskId}`);
    }

    if (errors.isEmpty) {
      return next();
    } else {
      const customError = new CustomError(400, 'Unauthorized', 'Task not accessed', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
