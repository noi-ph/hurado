import { Request, Response, NextFunction } from 'express';
import { BaseEntity } from 'typeorm';

import { AppDataSource } from 'orm/data-source';
import {
  File,
  Script,
  TaskAttachment,
  TestData,
  Subtask,
  TaskDeveloper,
  createScript,
  createFile,
} from 'orm/entities';
import { AllowedLanguages, TaskDeveloperRoles, TaskType } from 'orm/entities/enums';
import { ServerAPI } from 'types';
import { 
  FileRepository, 
  ScriptRepository, 
  SubtaskRepository, 
  TaskAttachmentRepository, 
  TaskDeveloperRepository, 
  TaskRepository, 
  TestDataRepository, 
  UserRepository 
} from 'orm/repositories';

export const editTask = async (req: Request, res: Response, next: NextFunction) => {
  const rbody = req.body as ServerAPI['TaskPayload'];
  const files: File[] = [];
  const data: TestData[] = [];
  const scripts: Script[] = [];
  const subtasks: Subtask[] = [];
  const developers: TaskDeveloper[] = [];
  const attachments: TaskAttachment[] = [];
  const toDelete: BaseEntity[] = [];

  const task = await TaskRepository.findOne({
    where: { id: req.params.id },
    relations: {
      testData: true,
      subtasks: true,
      developers: true,
      attachments: true,
    },
  });

  for (const s of [rbody.checkerScript, rbody.validatorScript]) {
    if (Object.keys(s).length) {
      let newFile = false;
      let file: File | null = null;
      if (s.file.id) {
        file = await FileRepository.findOne({ where: { id: s.file.id } });
        file.name = s.file.name;
        file.size = s.file.size;
        file.contents = req.files[s.file.name][0].buffer;
      } else {
        file = createFile({
          name: s.file.name,
          contents: req.files[s.file.name][0].buffer,
        });
        newFile = true;
      }
      files.push(file);

      let script: Script | null = null;
      if (s.id) {
        script = await ScriptRepository.findOne({ where: { id: s.id } });

        if (newFile) {
          toDelete.push(await script.file);
        }

        script.file = Promise.resolve(file);
        script.languageCode = s.languageCode;
        script.runtimeArgs = s.runtimeArgs;
      } else {
        script = createScript({
          file,
          languageCode: s.languageCode,
          runtimeArgs: s.runtimeArgs,
        });
      }
      scripts.push(script);
    }
  }

  // resolve checkerScript
  if (!scripts[0].id) {
    // a new checkerScript was made
    toDelete.push(await task.checkerScript);
  }
  task.checkerScript = Promise.resolve(scripts[0]);

  // resolve validatorScript
  const oldValidatorScipt = await task.validatorScript;
  if (scripts[1]) {
    if (!scripts[1].id && oldValidatorScipt) {
      // a new validatorScript was made
      toDelete.push(oldValidatorScipt);
    }
    task.validatorScript = Promise.resolve(scripts[1]);
  }

  task.title = rbody.title;
  task.slug = rbody.slug;

  if (rbody.description) {
    task.description = rbody.description;
  }

  task.statement = rbody.statement;
  task.allowedLanguages = rbody.allowedLanguages as AllowedLanguages;
  task.taskType = rbody.taskType as TaskType;
  task.scoreMax = rbody.scoreMax;
  task.timeLimit = rbody.timeLimit;
  task.memoryLimit = rbody.memoryLimit;
  task.compileTimeLimit = rbody.compileMemoryLimit;
  task.compileMemoryLimit = rbody.compileMemoryLimit;
  task.submissionSizeLimit = rbody.submissionSizeLimit;

  if (rbody.isPublicInArchive) {
    task.isPublicInArchive = true;
  }

  for (const d of rbody.data) {
    let testData: TestData | null = null;
    if (d.id) {
      testData = await TestDataRepository.findOne({ where: { id: d.id } });
    } else {
      testData = new TestData();
    }
    testData.task = Promise.resolve(task);
    testData.order = d.order;
    testData.name = d.name;
    testData.isSample = d.isSample;

    let inputFile: File | null = null;
    if (d.inputFile.id) {
      inputFile = await FileRepository.findOne({ where: { id: d.inputFile.id } });
      inputFile.name = d.inputFile.name;
      inputFile.size = d.inputFile.size;
      inputFile.contents = req.files[d.inputFile.name][0].buffer;
    } else {
      const oldInputFile = await testData.inputFile;
      if (oldInputFile) {
        toDelete.push(oldInputFile);
      }

      inputFile = createFile({
        name: d.inputFile.name,
        contents: req.files[d.inputFile.name][0].buffer,
      });
    }
    files.push(inputFile);
    testData.inputFile = Promise.resolve(inputFile);

    let outputFile: File | null = null;
    if (d.outputFile.id) {
      outputFile = await FileRepository.findOne({ where: { id: d.outputFile.id } });
      outputFile.name = d.outputFile.name;
      outputFile.size = d.outputFile.size;
      outputFile.contents = req.files[d.outputFile.name][0].buffer;
    } else {
      const oldOutputFile = await testData.outputFile;
      if (oldOutputFile) {
        toDelete.push(oldOutputFile);
      }

      outputFile = createFile({
        name: d.outputFile.name,
        contents: req.files[d.outputFile.name][0].buffer,
      });
    }
    files.push(outputFile);
    testData.outputFile = Promise.resolve(outputFile);

    if (Object.keys(d.judgeFile).length) {
      let judgeFile: File | null = null;
      if (d.judgeFile.id) {
        judgeFile = await FileRepository.findOne({ where: { id: d.judgeFile.id } });
        judgeFile.name = d.judgeFile.name;
        judgeFile.size = d.judgeFile.size;
        judgeFile.contents = req.files[d.judgeFile.name][0].buffer;
      } else {
        const oldJudgeFile = await testData.judgeFile;
        if (oldJudgeFile) {
          toDelete.push(oldJudgeFile);
        }

        judgeFile = createFile({
          name: d.judgeFile.name,
          contents: req.files[d.judgeFile.name][0].buffer,
        });
      }
      files.push(judgeFile);
      testData.judgeFile = Promise.resolve(judgeFile);
    }

    data.push(testData);
  }

  for (const s of rbody.subtasks) {
    for (const sc of [s.scorerScript, s.validatorScript]) {
      let newFile = false;
      let file: File | null = null;
      if (sc.file.id) {
        file = await FileRepository.findOne({ where: { id: sc.file.id } });
        file.name = sc.file.name;
        file.size = sc.file.size;
        file.contents = req.files[sc.file.name][0].buffer;
      } else {
        file = createFile({
          name: sc.file.name,
          contents: req.files[sc.file.name][0].buffer,
        });
        newFile = true;
      }
      files.push(file);

      let script: Script | null = null;
      if (sc.id) {
        script = await ScriptRepository.findOne({ where: { id: sc.id } });

        if (newFile) {
          toDelete.push(await script.file);
        }

        script.file = Promise.resolve(file);
        script.languageCode = sc.languageCode;
        script.runtimeArgs = sc.runtimeArgs;
      } else {
        script = createScript({
          file,
          languageCode: sc.languageCode,
          runtimeArgs: sc.runtimeArgs,
        });
      }
      scripts.push(script);
    }

    let subtask: Subtask | null = null;
    if (s.id) {
      subtask = await SubtaskRepository.findOne({ where: { id: s.id } });
    } else {
      subtask = new Subtask();
    }

    // resolve scorerScript
    if (!scripts[scripts.length - 2].id && (await subtask.scorerScript).id) {
      // a new scorerScript was made
      toDelete.push(await subtask.scorerScript);
    }
    subtask.scorerScript = Promise.resolve(scripts[scripts.length - 2]);

    // resolve validatorScript
    if (!scripts[scripts.length - 1].id && (await subtask.validatorScript).id) {
      // a new validatorScript was made
      toDelete.push(await subtask.validatorScript);
    }
    subtask.validatorScript = Promise.resolve(scripts[scripts.length - 1]);

    subtask.name = s.name;
    subtask.task = Promise.resolve(task);
    subtask.order = s.order;
    subtask.testDataPattern = s.testDataPattern;
    subtasks.push(subtask);
  }

  for (const a of rbody.attachments) {
    let attachment: TaskAttachment | null = null;
    if (a.id) {
      attachment = await TaskAttachmentRepository.findOne({ where: { id: a.id } });
    } else {
      attachment = new TaskAttachment();
    }
    attachment.task = Promise.resolve(task);

    let file: File | null = null;
    if (a.file.id) {
      file = await FileRepository.findOne({ where: { id: a.file.id } });
      file.name = a.file.name;
      file.size = a.file.size;
      file.contents = req.files[a.file.name][0].buffer;
    } else {
      const oldFile = await attachment.file;
      if (oldFile) {
        toDelete.push(oldFile);
      }

      file = createFile({
        name: a.file.name,
        contents: req.files[a.file.name][0].buffer,
      });
    }
    files.push(file);
    attachment.file = Promise.resolve(file);
    attachments.push(attachment);
  }

  for (const d of rbody.developers) {
    let dev: TaskDeveloper | null = null;
    if (d.id) {
      dev = await TaskDeveloperRepository.findOne({ where: { id: d.id } });
    } else {
      dev = new TaskDeveloper();
    }
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
    for (const d of toDelete) {
      await d.remove();
    }
  });

  res.status(200).send(task);
};
