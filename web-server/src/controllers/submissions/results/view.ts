import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Result } from 'orm/entities/submissions/Result';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const view = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

  const resultRepository = AppDataSource.getRepository(Result);
  try {
    const result = await resultRepository.findOne({ where: { id } });

    res.customSuccess(200, 'Task retrieved successfully', result);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};