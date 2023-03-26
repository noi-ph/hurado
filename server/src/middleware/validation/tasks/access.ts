import { Request, Response, NextFunction } from 'express';

import { TaskRepository, UserRepository } from 'orm/repositories';

const strict = async (req: Request, res: Response, next: NextFunction) => {
  const task = await TaskRepository.findOne({ where: { id: req.params.id } });

  if (!task) {
    res.status(404).end();
    return;
  }

  const user = await UserRepository.findOne({ where: { id: req.jwtPayload.id } });

  if (user.isAdmin || (await task.owner).id === user.id) {
    return next();
  } else {
    res.status(403).end();
  }
};

const lax = async (req: Request, res: Response, next: NextFunction) => {
  const task = await TaskRepository.findOne({ where: { id: req.params.id } });

  if (!task) {
    res.status(404).end();
    return;
  }

  if (!task.isPublicInArchive && req.jwtPayload === null) {
    res.status(401).end();
  } else {
    return next();
  }
};

export const validateAccess = (isStrict: boolean) => {
  if (isStrict) {
    return strict;
  } else {
    return lax;
  }
};
