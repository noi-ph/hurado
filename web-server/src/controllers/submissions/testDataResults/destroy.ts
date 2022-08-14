import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { TestDataResult } from 'orm/entities/submissions/TestDataResult';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

  const testDataResultRepository = AppDataSource.getRepository(TestDataResult);
  try {
    const testDataResult = await testDataResultRepository.findOne({ where: { id } });

    await testDataResultRepository.delete(id);
    res.customSuccess(200, 'TestDataResult successfully deleted', testDataResult);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};