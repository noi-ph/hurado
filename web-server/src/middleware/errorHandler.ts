import { Request, Response, NextFunction } from 'express';

export type Error<T> = {
  status: number;
  data: T;
}

export const errorHandler = (err: Error<any>, req: Request, res: Response, next: NextFunction) => {
  return res.status(err.status).json(err.data);
};
