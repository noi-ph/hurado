import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const validatorAccess = async (req: Request, res: Response, next: NextFunction) => {
  const taskId = parseInt(req.params.id);
  const userId = req.jwtPayload.id;

  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);

  try {
    const task = await taskRepository.findOne({ where: { id: taskId } });
    const user = await userRepository.findOne({ where: { id: userId } });

    if (task.ownerId != userId && !user.isAdmin) {
      const customError = new CustomError(400, 'Unauthorized', 'User has no access to this problem', [
        `User is neither an admin nor the owner of ${taskId}`,
      ]);
      return next(customError);
    }

    return next();
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
