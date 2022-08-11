import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { AllowedLanguages, Languages, TaskTypes } from 'orm/entities/tasks/types';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtPayload.id;
  const id = parseInt(req.params.id);
  const {
    title,
    slug,
    description,
    statement,
    allowedLanguages,
    taskType,
    scoreMax,
    checkerScript,
    checkerScriptId,
    timeLimit,
    memoryLimit,
    compileTimeLimit,
    compileMemoryLimit,
    submissionSizeLimit,
    validatorScript,
    validatorScriptId,
    isPublicInArchive,
    language,
  } = req.body;

  const taskRepository = AppDataSource.getRepository(Task);
  const userRepository = AppDataSource.getRepository(User);
  try {
    const task = await taskRepository.findOne({ where: { id } });

    const user = await userRepository.findOne({ where: { id: userId } });

    try {
      if (slug && slug != task.slug) {
        const otherTask = await taskRepository.findOne({ where: { slug } });

        if (otherTask) {
          const customError = new CustomError(400, 'Validation', 'Task already exists', [
            `Task ${slug} already exists`,
          ]);
          return next(customError);
        }

        try {
          task.setSlug(slug);
        } catch (err: unknown) {
          if (err instanceof CustomError) {
            return next(err);
          } else {
            const customError = new CustomError(400, 'Raw', 'Error', null, err);
            return next(customError);
          }
        }
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
        if (!Object.values(AllowedLanguages).includes(allowedLanguages)) {
          const customError = new CustomError(400, 'Validation', 'Invalid allowed language', [
            `${allowedLanguages} is invalid`,
          ]);
          return next(customError);
        }

        task.allowedLanguages = allowedLanguages;
      }

      if (taskType) {
        if (!Object.values(TaskTypes).includes(taskType)) {
          const customError = new CustomError(400, 'Validation', 'Invalid task type', [`${taskType} is invalid`]);
          return next(customError);
        }

        task.taskType = taskType;
      }

      if (scoreMax) {
        task.scoreMax = scoreMax;
      }

      if (checkerScript) {
        task.checkerScript = checkerScript;
      }

      if (checkerScriptId) {
        task.checkerScriptId = checkerScriptId;
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

      if (validatorScript) {
        task.validatorScript = validatorScript;
      }

      if (validatorScriptId) {
        task.validatorScriptId = validatorScriptId;
      }

      if (isPublicInArchive != null) {
        if (isPublicInArchive != task.isPublicInArchive && !user.isAdmin) {
          const customError = new CustomError(
            400,
            'Unauthorized',
            'Only administrators can set whether a problem can be viewed publicly',
            null,
          );
          return next(customError);
        }
        task.isPublicInArchive = isPublicInArchive;
      }

      if (language) {
        if (!Object.values(Languages).includes(language)) {
          const customError = new CustomError(400, 'Validation', 'Invalid language', [`${language} is invalid`]);
          return next(customError);
        }

        task.language = language;
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
