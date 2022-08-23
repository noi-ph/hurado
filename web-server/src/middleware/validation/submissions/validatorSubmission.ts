import { NextFunction, Request, Response } from "express"
import { AppDataSource } from "orm/data-source";
import { Task } from "orm/entities/tasks/Task";
import { SubmissionError } from "utils/Errors";
import { SubmissionPayload } from "utils/payloads";
import validator from "validator"

export const validateSubmission = async (req: Request, res: Response, next: NextFunction) => {
  const { submission } = JSON.parse(req.body['data']);
  let { taskId, languageCode } = submission as SubmissionPayload;

  const err: SubmissionError = {};

  const taskRepository = AppDataSource.getRepository(Task);
  const task = await taskRepository.findOne({ where: { id: taskId } });

  if (!task) {
    err.task = 'Task not found';
  }

  if (validator.isEmpty(languageCode)) {
    err.languageCode = 'Language code field is required';
  }

  if (!req.files.length) {
    err.file.file = 'File(s) are required';
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    req.body = submission;
    return next();
  }
}