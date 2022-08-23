import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

import { TaskError } from 'utils/Errors';
import { TaskPayload } from 'controllers/tasks/helpers/payloads';
import { validateScriptPayload } from '../scripts/validatePayload';
import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';

export const validateTaskPayload = async (req: Request, res: Response, next: NextFunction) => {
  let {
    title,
    slug,
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
    validator: taskValidator,
    isPublicInArchive,
    language
  } = JSON.parse(req.body['data']) as TaskPayload;

  checker.file.file = req.files[0];
  taskValidator.file.file = req.files[1];

  title = title ? title : '';
  slug = slug ? slug : '';
  statement = statement ? statement : '';
  allowedLanguages = allowedLanguages ? allowedLanguages : '';
  taskType = taskType ? taskType : '';
  language = language ? language : '';

  const err: TaskError = {};

  if (validator.isEmpty(title)) {
    err.title = 'Title field is required';
  }

  if (validator.isEmpty(slug)) {
    err.slug = 'Slug field is required';
  } else {
    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({ where: { slug } });
    if (task) {
      err.slug = 'Task with that slug already exists';
    }
  }

  if (validator.isEmpty(statement)) {
    err.statement = 'Statement field is required';
  }

  if (validator.isEmpty(allowedLanguages)) {
    err.allowedLanguages = 'Allowed languages field is required';
  }

  if (validator.isEmpty(taskType)) {
    err.taskType = 'Task type field is required';
  }

  if (!scoreMax) {
    err.scoreMax = 'Maximum score field is required';
  }

  const checkerError = validateScriptPayload(checker);
  if (Object.keys(checkerError).length) {
    err.checker = checkerError;
  }

  if (!timeLimit) {
    err.timeLimit = 'Time limit field is required';
  }

  if (!memoryLimit) {
    err.memoryLimit = 'Memory limit field is required';
  }

  if (!compileTimeLimit) {
    err.compileTimeLimit = 'Compile time limit field is required';
  }

  if (!compileMemoryLimit) {
    err.compileMemoryLimit = 'Compile memory limit field is required';
  }

  if (!submissionSizeLimit) {
    err.submissionSizeLimit = 'Submission size limit is required';
  }

  const validatorError = validateScriptPayload(taskValidator);
  if (Object.keys(validatorError).length) {
    err.validator = validatorError;
  }

  if (isPublicInArchive && (Object.keys(req.jwtPayload).length == 0 || !req.jwtPayload.isAdmin)) {
    err.isPublicInArchive = 'Only administrators can set this to "true"';
  }

  if (validator.isEmpty(language)) {
    err.language = 'Language field is required';
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    req.body = {
      title,
      slug,
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
      validator: taskValidator,
      isPublicInArchive,
      language
    };
    return next();
  }
}