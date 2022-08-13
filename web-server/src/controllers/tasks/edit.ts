import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { AllowedLanguages, Languages, TaskTypes } from 'orm/entities/tasks/types';
import { User } from 'orm/entities/users/User';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

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
          errors.put('slug', `Task ${slug} already exists`);
        } else {
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
          errors.put('allowedLanguages', `${allowedLanguages} is invalid`);
        } else {
          task.allowedLanguages = allowedLanguages;
        }
      }

      if (taskType) {
        if (!Object.values(TaskTypes).includes(taskType)) {
          errors.put('taskType', `${taskType} is invalid`);
        } else {
          task.taskType = taskType;
        }
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

      if (errors.isEmpty) {
        await taskRepository.save(task);
        res.customSuccess(200, 'Task succesfully edited', task);
      } else {
        const customError = new CustomError(400, 'Validation', 'Cannot edit task', null, errors);
        return next(customError);
      }
    } catch (err) {
      const customError = new CustomError(400, 'Raw', `Task ${slug} cannot be edited`, err, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
