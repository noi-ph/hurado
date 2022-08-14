import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Submission } from 'orm/entities/submissions/Submission';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

  const submissionRepository = AppDataSource.getRepository(Submission);
  try {
    const submission = await submissionRepository.findOne({ where: { id } });

    await submissionRepository.delete(id);
    res.customSuccess(200, 'submission successfully deleted', submission);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};