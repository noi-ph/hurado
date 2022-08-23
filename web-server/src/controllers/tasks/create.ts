import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { AllowedLanguages, Languages, TaskTypes } from 'orm/entities/tasks/types';
import { User } from 'orm/entities/users/User';
import { create as createScript } from 'controllers/scripts';

import { TaskPayload } from './helpers/payloads';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
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
    validator,
    isPublicInArchive,
    language
  } = req.body as TaskPayload;

  const userRepository = AppDataSource.getRepository(User);
  const taskRepository = AppDataSource.getRepository(Task);
  const task = new Task();

  const userId = req.jwtPayload.id;
  const user = await userRepository.findOne({ where: { id: userId } });

  if (description) {
    task.description = description;
  }

  task.owner = user;
  task.checkerScript = await createScript(checker);
  task.validatorScript = await createScript(validator);
  task.title = title;
  task.slug = slug;
  task.statement = statement;
  task.allowedLanguages = allowedLanguages as AllowedLanguages;
  task.taskType = taskType as TaskTypes;
  task.scoreMax = scoreMax;
  task.timeLimit = timeLimit;
  task.memoryLimit = memoryLimit;
  task.compileTimeLimit = compileTimeLimit;
  task.compileMemoryLimit = compileMemoryLimit;
  task.submissionSizeLimit = submissionSizeLimit;
  task.isPublicInArchive = isPublicInArchive;
  task.language = language as Languages;
  await taskRepository.save(task);

  res.status(200).send(task);
}