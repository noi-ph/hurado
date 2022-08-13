import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload;

  const taskRepository = AppDataSource.getRepository(Task);
  try {
    let tasks = await taskRepository.find({
      select: ['id', 'title', 'slug', 'isPublicInArchive'],
    });

    if (!userId) {
      const publicTasks: Task[] = [];
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].isPublicInArchive) {
          publicTasks.push(tasks[i]);
        }
      }
      tasks = publicTasks;
    }

    res.customSuccess(200, 'Tasks sent successfully', tasks);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
