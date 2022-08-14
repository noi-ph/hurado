import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

import { JwtPayload } from '../types/JwtPayload';
import { createJwtToken } from '../utils/createJwtToken';

export const maybeCheckJwt = (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.jwtPayload = null;
    return next();
  } else {
    const token = authHeader.split(' ')[1];
    let jwtPayload: { [key: string]: any };
    try {
      jwtPayload = jwt.verify(token, process.env.JWT_SECRET as string) as { [key: string]: any };
      ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
      req.jwtPayload = jwtPayload as JwtPayload;
    } catch (err) {
      req.jwtPayload = null;
      return next();
    }

    try {
      if (errors.isEmpty) {
        // Refresh and send a new token on every request
        const newToken = createJwtToken(jwtPayload as JwtPayload);
        res.setHeader('token', `Bearer ${newToken}`);
        return next();
      } else {
        const customError = new CustomError(400, 'Validation', 'Something went wrong', null, errors);
        return next(customError);
      }
    } catch (err) {
      const customError = new CustomError(400, 'Raw', "Token can't be created", err, errors);
      return next(customError);
    }
  }
};
