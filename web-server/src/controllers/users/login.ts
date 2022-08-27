import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { User } from 'orm/entities';
import { UserRepository } from 'orm/repositories';
import { JwtPayload, ServerAPI } from 'types';
import { createJwtToken } from 'utils';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  console.log('hey!1');
  const { email } = req.body as ServerAPI['LoginPayload'];

  try {
    const user = await UserRepository.findOne({ where: { email } });
    const jwtPayload: JwtPayload = { id: user.id, isAdmin: user.isAdmin };
    const token = createJwtToken(jwtPayload);
    res.status(200).send({ jwt: token, user });
  } catch (e) {
    res.status(500).end();
  }
};
