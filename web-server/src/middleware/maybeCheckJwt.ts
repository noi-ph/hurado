import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JwtPayload } from '../types/JwtPayload';
import { createJwtToken } from '../utils/createJwtToken';

export const maybeCheckJwt = (req: Request, res: Response, next: NextFunction) => {
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
      const newToken = createJwtToken(jwtPayload as JwtPayload);
      res.setHeader('token', `Bearer ${newToken}`);
      return next();
    } catch (err) {
      res.statusCode = 400;
      res.send("Token can't be created");
    }
  }
};
