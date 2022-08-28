import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JwtPayload } from '../types/JwtPayload';
import { createJwtToken } from '../utils/createJwtToken';

const strict = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');

  if (!authHeader || Object.keys(authHeader).length === 0) {
    res.status(401).end();
    return;
  }

  let jwtPayload: { [key: string]: any };

  try {
    jwtPayload = jwt.verify(authHeader, process.env.JWT_SECRET as string) as { [key: string]: any };
    ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
    req.jwtPayload = jwtPayload as JwtPayload;

    const newToken = createJwtToken(jwtPayload as JwtPayload);
    res.setHeader('token', newToken);
    return next();
  } catch (e) {
    res.status(500).end();
  }
};

const lax = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');

  if (!authHeader || Object.keys(authHeader).length === 0) {
    req.jwtPayload = null;
    return next();
  }

  let jwtPayload: { [key: string]: any };

  try {
    jwtPayload = jwt.verify(authHeader, process.env.JWT_SECRET as string) as { [key: string]: any };
    ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
    req.jwtPayload = jwtPayload as JwtPayload;

    const newToken = createJwtToken(jwtPayload as JwtPayload);
    res.setHeader('token', newToken);
    return next();
  } catch (e) {
    req.jwtPayload = null;
    return next();
  }
};

/**
 * Returns strict/lax logged-in checker middleware
 *
 * @param isStrict boolean
 * @returns middleware
 */
export const checkJwt = (isStrict: boolean) => {
  if (isStrict) {
    return strict;
  } else {
    return lax;
  }
};
