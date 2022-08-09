import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.jwtPayload.id;
  const {
    title,
    slug,
    description,
    statement,
    allowedLanguages,
    taskType,
    scoreMax,
    checker,
    timeLimit,
    memoryLimit,
    compileTimeLimit,
    compileMemoryLimit,
    submissionSizeLimit,
    isPublicInArchive,
  } = req.body;

  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);
  try {
    const task = await taskRepository.findOne({ where: { slug } });

    if (task) {
      const customError = new CustomError(400, 'General', 'Task already exists', [`Task ${slug} already exists`]);
      return next(customError);
    }

    try {
      const user = await userRepository.findOne({ where: { id } });
      const newTask = new Task();
      newTask.owner = user;
      newTask.ownerId = id;
      newTask.title = title;
      newTask.slug = slug;
      newTask.statement = statement;

      if (description) {
        newTask.description = description;
      }
      if (allowedLanguages) {
        newTask.allowedLanguages = allowedLanguages;
      }

      if (taskType) {
        newTask.taskType = taskType;
      }

      if (scoreMax) {
        newTask.scoreMax = scoreMax;
      }

      if (checker) {
        newTask.checker = checker;
      }

      if (timeLimit) {
        newTask.timeLimit = timeLimit;
      }

      if (memoryLimit) {
        newTask.memoryLimit = memoryLimit;
      }

      if (compileTimeLimit) {
        newTask.compileTimeLimit = compileTimeLimit;
      }

      if (compileMemoryLimit) {
        newTask.compileMemoryLimit = compileMemoryLimit;
      }

      if (submissionSizeLimit) {
        newTask.submissionSizeLimit = submissionSizeLimit;
      }

      if (isPublicInArchive != null) {
        newTask.isPublicInArchive = isPublicInArchive;
      }

      await taskRepository.save(newTask);

      res.send(newTask);
      res.customSuccess(200, 'Task succesfully created.');
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `Task ${slug} cannot be created`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
