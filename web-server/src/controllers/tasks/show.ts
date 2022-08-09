import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);

  const taskRepository = AppDataSource.getRepository(Task);
  try {
    const task = await taskRepository.findOne({ where: { id } });

    if (!task) {
      const customError = new CustomError(404, 'General', 'Task cannot be found', [`Task ${id} does not exist`]);
      return next(customError);
    }

    res.send(task);
    res.customSuccess(200, 'Task successfully sent.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
