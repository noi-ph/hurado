import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

const isAllowedAccess = async (userId: any) => {
  if (userId) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: parseInt(userId) } });
    if (user) {
      return true;
    }
  }
  return false;
};

export const view = async (req: Request, res: Response, next: NextFunction) => {
  const taskSlug = req.params.idOrSlug;

  const taskRepository = AppDataSource.getRepository(Task);
  const customError = new CustomError(404, 'General', 'Task cannot be found', [`Task ${taskSlug} does not exist`]);
  try {
    let task = await taskRepository.findOne({ where: { slug: taskSlug } });

    if (!task) {
      if (parseInt(taskSlug) != NaN) {
        task = await taskRepository.findOne({ where: { id: parseInt(taskSlug) } });
        if (!task) {
          return next(customError);
        }
      } else {
        return next(customError);
      }
    }

    if (task.isPublicInArchive) {
      res.send(task);
      res.customSuccess(200, 'Task successfully sent.');
    } else {
      const allowed = await isAllowedAccess(req.get('User-ID'));
      if (allowed) {
        res.send(task);
        res.customSuccess(200, 'Task successfully sent.');
      } else {
        const customError = new CustomError(404, 'General', 'Not found', null);
        return next(customError);
      }
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
