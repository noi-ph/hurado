import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';

export const validatorAccess = async (req: Request, res: Response, next: NextFunction) => {
  const taskId = parseInt(req.params.id);
  const userId = req.jwtPayload.id;

  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);

  const task = await taskRepository.findOne({ where: { id: taskId } });
  const user = await userRepository.findOne({ where: { id: userId } });

  if (task.ownerId != userId && !user.isAdmin) {
    res.statusCode = 401;
    res.send(`User is neither an admin nor the owner of ${taskId}`);
    return;
  }

  return next();
};
