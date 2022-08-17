import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../utils/response/custom-error/CustomError';
import { PossibleErrors } from 'utils/Errors';

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.HttpStatusCode).json(err.JSON);
};

export const errorInterceptor = (err: PossibleErrors, req: Request, res: Response, next: NextFunction) => {
  return res.status(400).json(err);
}