import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';
import { AllowedLanguages, Languages, TaskTypes } from 'orm/entities/tasks/types';
import { User } from 'orm/entities/users/User';
import { Script } from 'orm/entities/scripts/Script';
import { File } from 'orm/entities/files/File';

import { TaskPayload } from '../../utils/payloads';

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
  const task = new Task();

  const userId = req.jwtPayload.id;
  const user = await userRepository.findOne({ where: { id: userId } });

  const scripts: Script[] = [];
  const files: File[] = [];
  [checker, validator].forEach((object, index) => {
    const rawFile: Express.Multer.File = req.files[index];
    const file = new File(rawFile.originalname, rawFile.path);
    const script = new Script(file, checker.languageCode, checker.runtimeArgs);

    files.push(file);
    scripts.push(script);
  });

  if (description) {
    task.description = description;
  }

  task.owner = user;
  task.checkerScript = scripts[0];
  task.validatorScript = scripts[1];
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

  await AppDataSource.manager.transaction(async (transaction) => {
    await transaction.save(files);
    await transaction.save(scripts);
    await transaction.save(task);
  });

  res.status(200).send(task);
}