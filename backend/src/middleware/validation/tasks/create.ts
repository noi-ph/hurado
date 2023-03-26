import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { AllowedLanguages, TaskDeveloperRoles, TaskType } from 'orm/entities/enums';
import { ServerAPI } from 'types';
import { TaskRepository, UserRepository } from 'orm/repositories';

import { validateSlug } from './slug';

export const validationCreate = async (req: Request, res: Response, next: NextFunction) => {
  const rbody = req.body as ServerAPI['TaskPayload'];

  rbody.title = rbody.title ? rbody.title : '';
  rbody.slug = rbody.slug ? rbody.slug : '';
  rbody.description = rbody.description ? rbody.description : '';
  rbody.statement = rbody.statement ? rbody.statement : '';
  rbody.allowedLanguages = rbody.allowedLanguages ? rbody.allowedLanguages : '';
  rbody.taskType = rbody.taskType ? rbody.taskType : '';

  rbody.scoreMax = rbody.scoreMax ? rbody.scoreMax : 0;
  rbody.timeLimit = rbody.timeLimit ? rbody.timeLimit : 0;
  rbody.memoryLimit = rbody.memoryLimit ? rbody.memoryLimit : 0;
  rbody.compileTimeLimit = rbody.compileTimeLimit ? rbody.compileTimeLimit : 0;
  rbody.compileMemoryLimit = rbody.compileMemoryLimit ? rbody.compileMemoryLimit : 0;
  rbody.submissionSizeLimit = rbody.submissionSizeLimit ? rbody.submissionSizeLimit : 0;

  rbody.attachments = rbody.attachments ? rbody.attachments : [];
  rbody.subtasks = rbody.subtasks ? rbody.subtasks : [];
  rbody.data = rbody.data ? rbody.data : [];
  rbody.developers = rbody.developers ? rbody.developers : [];

  rbody.isPublicInArchive = rbody.isPublicInArchive ? rbody.isPublicInArchive : false;

  const files: { [name: string]: Express.Multer.File[] } = {};
  if (Array.isArray(req.files)) {
    for (let i = 0; i < req.files.length; i++) {
      files[req.files[i].originalname] = [req.files[i]];
    }
  } else {
    for (const category in req.files) {
      for (let i = 0; i < req.files[category].length; i++) {
        files[req.files[category][i].originalname] = [req.files[category][i]];
      }
    }
  }

  const err: ServerAPI['TaskError'] = {};

  if (validator.isEmpty(rbody.title)) {
    err.title = 'This field is required';
  }

  if (validator.isEmpty(rbody.slug)) {
    err.slug = 'This field is required';
  } else {
    const slugError = validateSlug(rbody.slug);
    if (Object.keys(slugError).length) {
      err.slug = slugError.slug;
    } else {
      const task = await TaskRepository.findOne({ where: { slug: rbody.slug } });
      if (task) {
        err.slug = 'That slug is already taken';
      }
    }
  }

  if (validator.isEmpty(rbody.statement)) {
    err.statement = 'This field is required';
  }

  if (validator.isEmpty(rbody.allowedLanguages)) {
    err.allowedLanguages = 'This field is required';
  } else if (!Object.values(AllowedLanguages).includes(rbody.allowedLanguages as AllowedLanguages)) {
    err.allowedLanguages = 'That language is invalid';
  }

  if (validator.isEmpty(rbody.taskType)) {
    err.taskType = 'This field is required';
  } else if (!Object.values(TaskType).includes(rbody.taskType as TaskType)) {
    err.taskType = 'That task type is invalid';
  }

  if (Number.isNaN(rbody.scoreMax) || rbody.scoreMax < 0) {
    err.scoreMax = 'Maximum score must be nonnegative';
  }

  if (Number.isNaN(rbody.timeLimit) || rbody.timeLimit <= 0) {
    err.timeLimit = 'Time limit must be more than zero';
  }

  if (Number.isNaN(rbody.memoryLimit) || rbody.memoryLimit <= 0) {
    err.memoryLimit = 'Memory limit must be more than zero';
  } else if (!Number.isNaN(rbody.memoryLimit) && rbody.memoryLimit % 2 ** 20 !== 0) {
    err.memoryLimit = 'Memory limit must be divisible by 2^20';
  }

  if (Number.isNaN(rbody.compileTimeLimit) || rbody.compileTimeLimit < 0) {
    err.compileTimeLimit = 'Compile time limit must be nonnegative';
  }

  if (Number.isNaN(rbody.compileMemoryLimit) || rbody.compileMemoryLimit < 0) {
    err.compileMemoryLimit = 'Compile memory limit must be nonnegative';
  }

  if (Number.isNaN(rbody.submissionSizeLimit) || rbody.submissionSizeLimit < 0) {
    err.submissionSizeLimit = 'Submission size limit must be nonnegative';
  }

  for (let i = 0; i < rbody.attachments.length; i++) {
    const name = rbody.attachments[i].file.name ? rbody.attachments[i].file.name : '';
    if (validator.isEmpty(name)) {
      err.attachments[i].file.name = 'This field is required';
    } else if (!(name in files)) {
      err.attachments[i].file.contents = 'This field is required';
    } else {
      const file = files[name][0];
      rbody.attachments[i].file.contents = file.buffer;
      rbody.attachments[i].file.size = file.size;
    }
  }

  let totalSubtaskScoreMax = 0;
  for (let i = 0; i < rbody.subtasks.length; i++) {
    rbody.subtasks[i].name = rbody.subtasks[i].name ? rbody.subtasks[i].name : '';

    const scorerScriptName = rbody.subtasks[i].scorerScript.file.name ? rbody.subtasks[i].scorerScript.file.name : '';
    rbody.subtasks[i].scorerScript.languageCode = rbody.subtasks[i].scorerScript.languageCode
      ? rbody.subtasks[i].scorerScript.languageCode
      : '';
    rbody.subtasks[i].scorerScript.runtimeArgs = rbody.subtasks[i].scorerScript.runtimeArgs
      ? rbody.subtasks[i].scorerScript.runtimeArgs
      : '';

    const validatorScriptName = rbody.subtasks[i].validatorScript.file.name
      ? rbody.subtasks[i].validatorScript.file.name
      : '';
    rbody.subtasks[i].validatorScript.languageCode = rbody.subtasks[i].validatorScript.languageCode
      ? rbody.subtasks[i].validatorScript.languageCode
      : '';
    rbody.subtasks[i].validatorScript.runtimeArgs = rbody.subtasks[i].validatorScript.runtimeArgs
      ? rbody.subtasks[i].validatorScript.runtimeArgs
      : '';

    rbody.subtasks[i].testDataPattern = rbody.subtasks[i].testDataPattern ? rbody.subtasks[i].testDataPattern : [];

    rbody.subtasks[i].order = rbody.subtasks[i].order ? rbody.subtasks[i].order : 0;
    const scoreMax = rbody.subtasks[i].scoreMax ? rbody.subtasks[i].scoreMax : 0;

    if (validator.isEmpty(rbody.subtasks[i].name)) {
      err.subtasks[i].name = 'This field is required';
    }

    if (validator.isEmpty(scorerScriptName)) {
      err.subtasks[i].scorerScript.file.name = 'This field is required';
    } else if (!(scorerScriptName in files)) {
      err.subtasks[i].scorerScript.file.contents = 'This field is required';
    } else {
      const file = files[scorerScriptName][0];
      rbody.subtasks[i].scorerScript.file.contents = file.buffer;
      rbody.subtasks[i].scorerScript.file.size = file.size;
    }

    if (validator.isEmpty(validatorScriptName)) {
      err.subtasks[i].validatorScript.file.name = 'This field is required';
    } else if (!(validatorScriptName in files)) {
      err.subtasks[i].validatorScript.file.contents = 'This field is required';
    } else {
      const file = files[validatorScriptName][0];
      rbody.subtasks[i].validatorScript.file.contents = file.buffer;
      rbody.subtasks[i].validatorScript.file.size = file.size;
    }

    // TODO validate testDataPattern
    // TODO validate order

    if (Number.isNaN(scoreMax) || scoreMax < 0) {
      err.subtasks[i].scoreMax = 'Maximum score must be nonnegative';
    } else {
      totalSubtaskScoreMax += scoreMax;
    }
  }

  if (rbody.scoreMax !== totalSubtaskScoreMax) {
    err.scoreMax = 'That maximum score does not match total maximum scores of subtasks';
  }

  for (let i = 0; i < rbody.data.length; i++) {
    rbody.data[i].order = rbody.data[i].order ? rbody.data[i].order : 0;
    rbody.data[i].name = rbody.data[i].name ? rbody.data[i].name : '';
    rbody.data[i].isSample = rbody.data[i].isSample ? rbody.data[i].isSample : false;

    const inputFileName = rbody.data[i].inputFile.name ? rbody.data[i].inputFile.name : '';
    const outputFileName = rbody.data[i].outputFile.name ? rbody.data[i].outputFile.name : '';
    const judgeFileName = rbody.data[i].judgeFile.name ? rbody.data[i].judgeFile.name : '';

    // TODO validate order

    if (validator.isEmpty(rbody.data[i].name)) {
      err.data[i].name = 'This field is required';
    }

    if (validator.isEmpty(inputFileName)) {
      err.data[i].inputFile.name = 'This field is required';
    } else if (!(inputFileName in files)) {
      err.data[i].inputFile.contents = 'This field is required';
    } else {
      const file = files[inputFileName][0];
      rbody.data[i].inputFile.contents = file.buffer;
      rbody.data[i].inputFile.size = file.size;
    }

    // TODO validate outputFile

    if (validator.isEmpty(outputFileName)) {
      err.data[i].outputFile.name = 'This field is required';
    } else if (!(outputFileName in files)) {
      err.data[i].outputFile.contents = 'This field is required';
    } else {
      const file = files[outputFileName][0];
      rbody.data[i].outputFile.contents = file.buffer;
      rbody.data[i].outputFile.size = file.size;
    }

    if (!validator.isEmpty(judgeFileName)) {
      if (!(judgeFileName in files)) {
        err.data[i].judgeFile.contents = 'This field is required';
      } else {
        const file = files[judgeFileName][0];
        rbody.data[i].judgeFile.contents = file.buffer;
        rbody.data[i].judgeFile.size = file.size;
      }
    }
  }

  for (let i = 0; i < rbody.developers.length; i++) {
    const order = rbody.developers[i].order ? rbody.developers[i].order : 0;
    const username = rbody.developers[i].username ? rbody.developers[i].username : '';
    const role = rbody.developers[i].role ? rbody.developers[i].role : '';

    // TODO validate order

    if (validator.isEmpty(username)) {
      err.developers[i].username = 'This field is required';
    } else {
      const user = await UserRepository.findOne({ where: { username } });
      if (!user) {
        err.developers[i].username = 'User not found';
      }
    }

    if (validator.isEmpty(role)) {
      err.developers[i].role = 'This field is required';
    } else if (!Object.values(TaskDeveloperRoles).includes(role as TaskDeveloperRoles)) {
      err.developers[i].role = 'Task developer role is invalid';
    }
  }

  const user = await UserRepository.findOne({ where: { id: req.jwtPayload.id } });

  if (rbody.isPublicInArchive && !user.isAdmin) {
    err.isPublicInArchive = 'Only admins can toggle this setting';
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    req.body = rbody;
    req.files = files;
    return next();
  }
};
