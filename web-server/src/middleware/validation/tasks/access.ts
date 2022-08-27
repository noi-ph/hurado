import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task, User } from 'orm/entities';

const strict = async (req: Request, res: Response, next: NextFunction) => {
  const task = await AppDataSource.getRepository(Task).findOne({ where: { id: req.params.id } });

  if (!task) {
    res.status(404).end();
    return;
  }

  const user = await AppDataSource.getRepository(User).findOne({ where: { id: req.jwtPayload.id } });

  if (user.isAdmin || (await task.owner).id === user.id) {
    return next();
  } else {
    res.status(403).end();
  }
};

const lax = async (req: Request, res: Response, next: NextFunction) => {
  const task = await AppDataSource.getRepository(Task).findOne({ where: { id: req.params.id } });

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
