import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { JwtPayload } from 'types/JwtPayload';
import { createJwtToken } from 'utils/createJwtToken';
import { UserError } from 'utils/Errors';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);

  const err: UserError = {};

  try {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      err.email = `User with email ${email} not found`;
    } else if (!user.checkIfPasswordMatch(password)) {
      err.password = 'Password is incorrect';
    }

    if (Object.keys(err).length) {
      return next(err);
    } else {
      const jwtPayload: JwtPayload = {
        id: user.id,
        isAdmin: user.isAdmin,
      };
  
      try {
        const token = createJwtToken(jwtPayload);
        res.status(200);
        res.send({ jwt: `Bearer ${token}`, user });
      } catch (e) {
        err.raw = e;
        return next(err);
      }
    }
  } catch (e) {
    err.raw = e;
    return next(err);
  }
};
