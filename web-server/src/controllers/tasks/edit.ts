import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id);
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
  try {
    const task = await taskRepository.findOne({ where: { id } });

    try {
      if (slug) {
        const otherTask = await taskRepository.findOne({ where: { slug } });

        if (otherTask) {
          const customError = new CustomError(400, 'Validation', 'Task already exists', [
            `Task ${slug} already exists`,
          ]);
          return next(customError);
        }

        task.slug = slug;
      }

      if (title) {
        task.title = title;
      }

      if (statement) {
        task.statement = statement;
      }

      if (description) {
        task.description = description;
      }

      if (allowedLanguages) {
        task.allowedLanguages = allowedLanguages;
      }

      if (taskType) {
        task.taskType = taskType;
      }

      if (scoreMax) {
        task.scoreMax = scoreMax;
      }

      if (checker) {
        task.checker = checker;
      }

      if (timeLimit) {
        task.timeLimit = timeLimit;
      }

      if (memoryLimit) {
        task.memoryLimit = memoryLimit;
      }

      if (compileTimeLimit) {
        task.compileTimeLimit = compileTimeLimit;
      }

      if (compileMemoryLimit) {
        task.compileMemoryLimit = compileMemoryLimit;
      }

      if (submissionSizeLimit) {
        task.submissionSizeLimit = submissionSizeLimit;
      }

      if (isPublicInArchive != null) {
        task.isPublicInArchive = isPublicInArchive;
      }

      await taskRepository.save(task);

      res.send(task);
      res.customSuccess(200, 'Task succesfully edited.');
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `Task ${slug} cannot be edited`, null, err);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
