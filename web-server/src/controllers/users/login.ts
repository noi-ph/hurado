import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "orm/data-source";
import { User } from "orm/entities";
import { JwtPayload, ServerAPI } from "types";
import { createJwtToken } from "utils";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as ServerAPI['LoginPayload'];
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { email } });
    const jwtPayload: JwtPayload = { id: user.id, isAdmin: user.isAdmin };
    const token = createJwtToken(jwtPayload);
    res.status(200).send({ jwt: token, user });
  } catch (e) {
    res.status(500).end();
  }
};
