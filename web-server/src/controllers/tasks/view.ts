import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';

const isAllowedAccess = async (req: Request) => {
  if (req.jwtPayload) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.jwtPayload.id } });
    if (user) {
      // TODO add more validation if needed
      return true;
    }
  }
  return false;
};

export const view = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const taskSlug = req.params.idOrSlug;

  const taskRepository = AppDataSource.getRepository(Task);
  try {
    let task = await taskRepository.findOne({ where: { slug: taskSlug } });

    if (!task) {
      const taskId = parseInt(taskSlug);
      if (taskId != NaN) {
        task = await taskRepository.findOne({ where: { id: taskId } });
        if (!task) {
          errors.put('task', `Task with id ${taskId} not found`);
        }
      } else {
        errors.put('task', `Task with slug ${taskSlug} not found`);
      }
    }

    if (errors.isEmpty) {
      const allowed = await isAllowedAccess(req);
      if (task.isPublicInArchive || allowed) {
        res.customSuccess(200, 'Task successfully sent', task);
      } else {
        errors.put('user', `User has no authorization to access task ${task.id}`);
      }
    }

    if (!errors.isEmpty) {
      const customError = new CustomError(400, 'Validation', 'Task cannot be shown', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
