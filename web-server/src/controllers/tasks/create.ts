import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Script } from 'orm/entities/scripts/Script';
import { Task } from 'orm/entities/tasks/Task';
import { AllowedLanguages, Languages, TaskTypes } from 'orm/entities/tasks/types';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = req.jwtPayload.id;
  const {
    title,
    slug,
    description,
    statement,
    allowedLanguages,
    taskType,
    scoreMax,
    checkerScriptId,
    timeLimit,
    memoryLimit,
    compileTimeLimit,
    compileMemoryLimit,
    submissionSizeLimit,
    validatorScriptId,
    isPublicInArchive,
    language,
  } = req.body;

  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);
  const scriptRepository = AppDataSource.getRepository(Script);

  try {
    let task = await taskRepository.findOne({ where: { slug } });

    const user = await userRepository.findOne({ where: { id } });

    if (task) {
      errors.put('task', `Task wth id ${id} already exists`);
    } else {
      task = new Task();
      task.owner = user;
      task.ownerId = id;
      task.title = title;
      task.statement = statement;

      try {
        task.setSlug(slug);
      } catch (err: unknown) {
        if (err instanceof CustomError) {
          errors.extend(err.JSON.errors);
        } else {
          const customError = new CustomError(400, 'Raw', 'Error', err, errors);
          return next(customError);
        }
      }

      if (description) {
        task.description = description;
      }

      if (allowedLanguages) {
        if (!Object.values(AllowedLanguages).includes(allowedLanguages)) {
          errors.put('task', `${allowedLanguages} is invalid`);
        } else {
          task.allowedLanguages = allowedLanguages;
        }
      }
      if (taskType) {
        if (!Object.values(TaskTypes).includes(taskType)) {
          errors.put('task', `${taskType} is invalid`);
        } else {
          task.taskType = taskType;
        }
      }

      if (scoreMax) {
        task.scoreMax = scoreMax;
      }

      if (checkerScriptId) {
        const checker = await scriptRepository.findOne({ where: { id: checkerScriptId } });
        task.checkerScript = checker;
        task.checkerScriptId = checker.id;
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

      if (validatorScriptId) {
        const validator = await scriptRepository.findOne({ where: { id: validatorScriptId } });
        task.validatorScript = validator;
        task.validatorScriptId = validator.id;
      }

      if (isPublicInArchive != null) {
        if (isPublicInArchive && !user.isAdmin) {
          errors.put('isPublicInArchive', 'Only administrators can access this setting');
        } else {
          task.isPublicInArchive = isPublicInArchive;
        }
      }

      if (language) {
        if (!Object.values(Languages).includes(language)) {
          errors.put('language', `${language} is invalid`);
        } else {
          task.language = language;
        }
      }
    }

    if (errors.isEmpty) {
      await taskRepository.save(task);
      res.customSuccess(200, 'Task succesfully created', task);
    } else {
      const customError = new CustomError(400, 'Validation', 'Task cannot be created', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
