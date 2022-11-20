import { Request, Response, NextFunction } from 'express';

export const ok = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).end();
};