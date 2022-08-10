import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const view = async (req: Request, res: Response, next: NextFunction) => {
  const taskSlug = req.params.idOrSlug;

  const taskRepository = AppDataSource.getRepository(Task);
  const customError = new CustomError(404, 'General', 'Task cannot be found', [`Task ${taskSlug} does not exist`]);
  try {
    const task = await taskRepository.findOne({ where: { slug: taskSlug } });
    if (!task) {
      if (parseInt(taskSlug) != NaN) {
        const task1 = await taskRepository.findOne({ where: { id: parseInt(taskSlug) } });
        if (task1) {
          res.send(task1);
          res.customSuccess(200, 'Task successfully sent.');
        } else {
          return next(customError);
        }
      } else {
        return next(customError);
      }
    } else {
      res.send(task);
      res.customSuccess(200, 'Task successfully sent.');
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
