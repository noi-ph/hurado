import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

import { UserRepository } from 'orm/repositories';
import { JwtPayload, ServerAPI } from 'types';
import { createJwtToken } from 'utils';
import { Shape } from 'utils/shape';

export const sLoginPayload = Shape<ServerAPI['LoginPayload']>({
  email: yup.string().required('Email is required').email('Email must be a valid email address'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 16 characters long'),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as ServerAPI['LoginPayload'];

  const user = await UserRepository.findOne({ where: { email } });
  const jwtPayload: JwtPayload = { id: user.id, isAdmin: user.isAdmin };
  const token = createJwtToken(jwtPayload);
  res.status(200).send({ jwt: token, user });
};
