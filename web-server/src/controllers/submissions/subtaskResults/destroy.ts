import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { SubtaskResult } from 'orm/entities/submissions/SubtaskResult';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

  const subtaskResultRepository = AppDataSource.getRepository(SubtaskResult);
  try {
    const subtaskResult = await subtaskResultRepository.findOne({ where: { id } });

    await subtaskResultRepository.delete(id);
    res.customSuccess(200, 'SubtaskResult successfully deleted', subtaskResult);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};