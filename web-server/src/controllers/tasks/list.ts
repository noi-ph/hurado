import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const taskRepository = AppDataSource.getRepository(Task);
  try {
    const tasks = await taskRepository.find({
      select: ['id', 'title', 'slug'],
    });
    res.customSuccess(200, 'Tasks sent successfully', tasks);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
