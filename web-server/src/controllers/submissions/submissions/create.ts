import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Submission } from 'orm/entities/submissions/Submission';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const ownerId = req.jwtPayload.id;

  const { taskId, createdAt, languageCode } = req.body;

  const submissionRepository = AppDataSource.getRepository(Submission);
  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id: ownerId } });
    const task = await taskRepository.findOne({ where: { id: taskId } });

    if (!user) {
      errors.put('user', `User ${ownerId} not found`);
    }

    if (!task) {
      errors.put('task', `Task ${taskId} not found`);
    }

    const submission = new Submission();
    submission.owner = user;
    submission.ownerId = user.id;
    submission.task = task;
    submission.taskId = task.id;
    submission.createdAt = createdAt;
    submission.languageCode = languageCode;
    
    if (errors.isEmpty) {
      await submissionRepository.save(submission);
      res.customSuccess(200, 'Submission successfully created', submission);
    } else {
      const customError = new CustomError(400, 'Validation', 'Submission cannot be created', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}