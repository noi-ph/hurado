import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../utils/response/custom-error/CustomError';

export const checkRole = (isSelfAllowed = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id, isAdmin } = req.jwtPayload;
    const { id: requestId } = req.params;

    let errorSelfAllowed: string | null = null;
    if (isSelfAllowed) {
      if (id === parseInt(requestId)) {
        return next();
      }
      errorSelfAllowed = 'Self allowed action.';
    }

    if (!isAdmin) {
      const errors = ['Unauthorized - Insufficient user rights', `Current role: Not Admin. Required role: Admin`];
      if (errorSelfAllowed) {
        errors.push(errorSelfAllowed);
      }
      const customError = new CustomError(401, 'Unauthorized', 'Unauthorized - Insufficient user rights', errors);
      return next(customError);
    }
    return next();
  };
};
