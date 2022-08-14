import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { SubmissionFile } from 'orm/entities/submissions/SubmissionFile';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const view = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

  const submissionFileRepository = AppDataSource.getRepository(SubmissionFile);
  try {
    const submissionFile = await submissionFileRepository.findOne({ where: { id } });

    res.customSuccess(200, 'Task retrieved successfully', submissionFile);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};