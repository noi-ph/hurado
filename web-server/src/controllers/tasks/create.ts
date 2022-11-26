import { NextFunction, Request, Response } from 'express';

import { AppDataSource } from 'orm/data-source';
import {
  File,
  Script,
  Subtask,
  Task,
  TaskAttachment,
  TaskDeveloper,
  TestData
} from 'orm/entities';
import { AllowedLanguages, TaskDeveloperRoles, TaskType } from 'orm/entities/enums';
import { ServerAPI } from 'types';
import { UserRepository } from 'orm/repositories';

export const createTask = async (req: Request, res: Response, _next: NextFunction) => {
  const rbody = req.body as ServerAPI['TaskPayload'];
  const files: File[] = [];
  const data: TestData[] = [];
  const scripts: Script[] = [];
  const subtasks: Subtask[] = [];
  const developers: TaskDeveloper[] = [];
  const attachments: TaskAttachment[] = [];

  [rbody.checkerScript, rbody.validatorScript].forEach((s) => {
    if (Object.keys(s).length) {
      const file = new File();
      file.name = s.file.name;
      file.contents = req.files[s.file.name][0].buffer;
      file.size = file.contents.byteLength;
      files.push(file);

      const script = new Script();
      script.file = Promise.resolve(file);
      script.languageCode = s.languageCode;
      script.runtimeArgs = s.runtimeArgs;
      scripts.push(script);
    }
  });

  const task = new Task();
  task.owner = Promise.resolve(await UserRepository.findOne({ where: { id: req.jwtPayload.id } }));
  task.title = rbody.title;
  task.slug = rbody.slug;

  if (rbody.description) {
    task.description = rbody.description;
  }

  task.statement = rbody.statement;
  task.allowedLanguages = rbody.allowedLanguages as AllowedLanguages;
  task.taskType = rbody.taskType as TaskType;
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
    const inputFile = new File();
    inputFile.name = d.inputFile.name;
    inputFile.contents = req.files[d.inputFile.name][0].buffer;
    inputFile.size = inputFile.contents.byteLength;
    files.push(inputFile);

    const outputFile = new File();
    outputFile.name = d.outputFile.name;
    outputFile.contents = req.files[d.outputFile.name][0].buffer;
    outputFile.size = outputFile.contents.byteLength;
    files.push(outputFile);

    const testData = new TestData();
    testData.task = Promise.resolve(task);
    testData.order = d.order;
    testData.name = d.name;
    testData.inputFile = Promise.resolve(inputFile);
    testData.outputFile = Promise.resolve(outputFile);

    if (Object.keys(d.judgeFile).length) {
      const judgeFile = new File();
      judgeFile.name = d.judgeFile.name;
      judgeFile.contents = req.files[d.judgeFile.name][0].buffer;
      judgeFile.size = judgeFile.contents.byteLength;
      files.push(judgeFile);

      testData.judgeFile = Promise.resolve(judgeFile);
    }

    testData.isSample = d.isSample;
    data.push(testData);
  });

  rbody.subtasks.forEach((s) => {
    const scorerFile = new File();
    scorerFile.name = s.scorerScript.file.name;
    scorerFile.contents = req.files[s.scorerScript.file.name][0].buffer;
    scorerFile.size = scorerFile.contents.byteLength;
    files.push(scorerFile);

    const scorerScript = new Script();
    scorerScript.file = Promise.resolve(scorerFile);
    scorerScript.languageCode = s.scorerScript.languageCode;
    scorerScript.runtimeArgs = s.scorerScript.runtimeArgs;
    scripts.push(scorerScript);

    const validatorFile = new File();
    validatorFile.name = s.validatorScript.file.name;
    validatorFile.contents = req.files[s.validatorScript.file.name][0].buffer;
    validatorFile.size = validatorFile.contents.byteLength;
    files.push(validatorFile);

    const validatorScript = new Script();
    validatorScript.file = Promise.resolve(validatorFile);
    validatorScript.languageCode = s.validatorScript.languageCode;
    validatorScript.runtimeArgs = s.validatorScript.runtimeArgs;
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
    const file = new File();
    file.name = a.file.name;
    file.contents = req.files[a.file.name][0].buffer;
    file.size = file.contents.byteLength;
    files.push(file);

    const attachment = new TaskAttachment();
    attachment.task = Promise.resolve(task);
    attachment.file = Promise.resolve(file);
    attachments.push(attachment);
  });

  for (const d of rbody.developers) {
    const dev = new TaskDeveloper();
    dev.task = Promise.resolve(task);
    dev.user = Promise.resolve(await UserRepository.findOne({ where: { username: d.username } }));
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
