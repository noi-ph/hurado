import { Request, Response, NextFunction } from 'express';
import { PossibleErrors } from 'utils/Errors';

export type Error<T> = {
  status: number;
  data: T;
}

export const errorHandler = (err: Error<any>, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status).json(err.data);
};

export const errorInterceptor = (err: PossibleErrors, req: Request, res: Response, next: NextFunction) => {
  if (err.status) return res.status(err.status).json(err);
  else return res.status(200).json(err);
}