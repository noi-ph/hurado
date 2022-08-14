import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities/users/User';
import { JwtPayload } from 'types/JwtPayload';
import { createJwtToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const { email, password } = req.body;

  const userRepository = AppDataSource.getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      errors.put('email', `User with email ${email} does not exist`);
    } else {
      if (!user.checkIfPasswordMatch(password)) {
        errors.put('password', `Password is incorrect`);
      }
    }
    const jwtPayload: JwtPayload = {
      id: user.id,
      isAdmin: user.isAdmin,
    };

    if (errors.isEmpty) {
      try {
        const token = createJwtToken(jwtPayload);
        res.customSuccess(200, 'Token successfully created.', {
          jwt: `Bearer ${token}`,
          user: user,
        });
      } catch (err) {
        const customError = new CustomError(400, 'Raw', "Token can't be created", err, errors);
        return next(customError);
      }
    } else {
      const customError = new CustomError(400, 'Validation', 'Cannot log in', null, errors);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
};
