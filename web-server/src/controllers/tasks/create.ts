import { Request, Response, NextFunction } from 'express';

import { ServerAPI } from 'types';
import { File, Script, Subtask, TaskAttachment, TestData, Task, User, TaskDeveloper } from 'orm/entities';
import { AppDataSource } from 'orm/data-source';
import { AllowedLanguages, TaskDeveloperRoles, TaskTypes } from 'orm/entities/enums';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  const rbody = req.body as ServerAPI['TaskPayload'];
  const files: File[] = [];
  const data: TestData[] = [];
  const scripts: Script[] = [];
  const subtasks: Subtask[] = [];
  const developers: TaskDeveloper[] = [];
  const attachments: TaskAttachment[] = [];

  [rbody.checkerScript, rbody.validatorScript].forEach((s) => {
    if (Object.keys(s).length) {
      const file = new File(s.file.name, s.file.size, req.files[s.file.name][0].buffer);
      files.push(file);

      const script = new Script(file, s.languageCode, s.runtimeArgs);
      scripts.push(script);
    }
  });

  const task = new Task();
  task.owner = Promise.resolve(await AppDataSource.getRepository(User).findOne({ where: { id: req.jwtPayload.id } }));
  task.title = rbody.title;
  task.slug = rbody.slug;

  if (rbody.description) {
    task.description = rbody.description;
  }

  task.statement = rbody.statement;
  task.allowedLanguages = rbody.allowedLanguages as AllowedLanguages;
  task.taskType = rbody.taskType as TaskTypes;
  task.scoreMax = rbody.scoreMax;
  task.checkerScript = Promise.resolve(scripts[0]);
  task.timeLimit = rbody.timeLimit;
  task.memoryLimit = rbody.memoryLimit;
  task.compileTimeLimit = rbody.compileMemoryLimit;
  task.compileMemoryLimit = rbody.compileMemoryLimit;
  task.submissionSizeLimit = rbody.submissionSizeLimit;

  if (scripts[1]) {
    task.validatorScript = Promise.resolve(scripts[1]);
  }

  if (rbody.isPublicInArchive) {
    task.isPublicInArchive = true;
  }

  rbody.data.forEach((d) => {
    const inputFile = new File(d.inputFile.name, d.inputFile.size, req.files[d.inputFile.name][0].buffer);
    files.push(inputFile);
    
    const outputFile = new File(d.outputFile.name, d.outputFile.size, req.files[d.outputFile.name][0].buffer);
    files.push(outputFile);

    const testData = new TestData();
    testData.task = Promise.resolve(task);
    testData.order = d.order;
    testData.name = d.name;
    testData.inputFile = Promise.resolve(inputFile);
    testData.outputFile = Promise.resolve(outputFile);
    
    if (Object.keys(d.judgeFile).length) {
      const judgeFile = new File(d.judgeFile.name, d.judgeFile.size, req.files[d.judgeFile.name][0].buffer);
      files.push(judgeFile);

      testData.judgeFile = Promise.resolve(judgeFile);
    }

    testData.isSample = d.isSample;
    data.push(testData);
  });

  rbody.subtasks.forEach((s) => {
    const scorerFile = new File(s.scorerScript.file.name, s.scorerScript.file.size, req.files[s.scorerScript.file.name][0].buffer);
    files.push(scorerFile);

    const scorerScript = new Script(scorerFile, s.scorerScript.languageCode, s.scorerScript.runtimeArgs);
    scripts.push(scorerScript);

    const validatorFile = new File(s.validatorScript.file.name, s.validatorScript.file.size, req.files[s.validatorScript.file.name][0].buffer);
    files.push(validatorFile);

    const validatorScript = new Script(validatorFile, s.validatorScript.languageCode, s.validatorScript.runtimeArgs);
    scripts.push(validatorScript);

    const subtask = new Subtask();
    subtask.name = s.name;
    subtask.task = Promise.resolve(task);
    subtask.order = s.order;
    subtask.scorerScript = Promise.resolve(scorerScript);
    subtask.validatorScript = Promise.resolve(validatorScript);
    subtask.testDataPattern = s.testDataPattern;
    subtasks.push(subtask);
  });

  rbody.attachments.forEach((a) => {
    const file = new File(a.file.name, a.file.size, req.files[a.file.name][0].buffer);
    files.push(file);

    const attachment = new TaskAttachment();
    attachment.task = Promise.resolve(task);
    attachment.file = Promise.resolve(file);
    attachments.push(attachment);
  });

  const userRepository = AppDataSource.getRepository(User);
  for (const d of rbody.developers) {
    const dev = new TaskDeveloper();
    dev.task = Promise.resolve(task);
    dev.user = Promise.resolve(await userRepository.findOne({ where: { username: d.username } }));
    dev.order = d.order;
    dev.role = d.role as TaskDeveloperRoles;
    developers.push(dev);
  }

  await AppDataSource.manager.transaction(async (transaction) => {
    await transaction.save(files);
    await transaction.save(data);
    await transaction.save(scripts);
    await transaction.save(subtasks);
    await transaction.save(developers);
    await transaction.save(attachments);
  });

  res.status(200).send(task);
};
