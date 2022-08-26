import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "orm/data-source";
import { User } from "orm/entities";
import { ServerAPI } from "types";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body as ServerAPI['RegisterPayload'];
  const userRepository = AppDataSource.getRepository(User);
  
  try {
    const user = new User();
    user.email = email;
    user.username = username;
    user.setPassword(password);
    await userRepository.save(user);
    res.status(200).end();
  } catch (e) {
    res.status(500).end();
  }
};
