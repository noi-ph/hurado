import { Request, Response, NextFunction } from "express"
import validator from "validator";

import { AppDataSource } from "orm/data-source";
import { Task } from "orm/entities/tasks/Task";
import { SubmissionError, SubmissionFileError } from "utils/Errors";
import { SubmissionFilePayload, SubmissionPayload } from "utils/payloads"
import { validateFilePayload } from "../files/validatePayload";

const validateSubmission = async (data: SubmissionPayload) => {
  let { taskId, languageCode } = data;

  languageCode = languageCode ? languageCode : '';

  const err: SubmissionError = {};

  const taskRepository = AppDataSource.getRepository(Task);
  const task = await taskRepository.findOne({ where: { id: taskId } });

  if (validator.isEmpty(languageCode)) {
    err.languageCode = 'Code language field is required';
  }

  if (!task) {
    err.task = 'Task does not exist'
  }

  return err;
}

export const validateSubmissionPayload = async (req: Request, res: Response, next: NextFunction) => {
  let { submission, file } = JSON.parse(req.body['data']) as SubmissionFilePayload;

  const err: SubmissionFileError = {};

  const submissionError = await validateSubmission(submission);
  if (Object.keys(submissionError).length) {
    err.submission = submissionError;
  }

  file.file = req.files[0];
  const fileError = validateFilePayload(file);
  if (Object.keys(fileError).length) {
    err.file = fileError;
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    req.body = { submission, file };
    return next();
  }
}