import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "orm/data-source";
import { User } from "orm/entities";

export const validationShow = async (req: Request, res: Response, next: NextFunction) => {
  const requestorId = req.jwtPayload.id;
  const requestedId = req.params.id;
  const userRepository = AppDataSource.getRepository(User);
  const requestor = await userRepository.findOne({ where: { id: requestorId } });

  if (requestor.isAdmin || requestorId === requestedId) {
    return next();
  } else {
    res.status(403).end();
  }
};
