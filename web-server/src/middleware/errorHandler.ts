import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/response/custom-error/CustomError';
import { PossibleErrors } from 'utils/Errors';

export type Error<T> = {
  status: number;
  data: T;
}

export const errorHandler = (err: Error<any>, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status).json(err.data);
};

export const errorInterceptor = (err: PossibleErrors, req: Request, res: Response, next: NextFunction) => {
  return res.status(400).json(err);
}