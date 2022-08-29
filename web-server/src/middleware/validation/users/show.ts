import { Request, Response, NextFunction } from "express";

import { UserRepository } from "orm/repositories";

export const validationShow = async (req: Request, res: Response, next: NextFunction) => {
  const requestorId = req.jwtPayload.id;
  const requestedId = req.params.id;
  const requestor = await UserRepository.findOne({ where: { id: requestorId } });

  if (requestor.isAdmin || requestorId === requestedId) {
    return next();
  } else {
    res.status(403).end();
  }
};
