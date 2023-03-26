import { Request, Response, NextFunction } from "express";

import { User } from "orm/entities";
import { UserRepository } from "orm/repositories";
import { ServerAPI } from "types";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body as ServerAPI['RegisterPayload'];
  
  try {
    const user = new User();
    user.email = email;
    user.username = username;
    user.setPassword(password);
    await UserRepository.save(user);
    res.status(200).end();
  } catch (e) {
    res.status(500).end();
  }
};
