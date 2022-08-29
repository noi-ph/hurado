import { Request, Response, NextFunction } from 'express';

import { TaskRepository } from 'orm/repositories';

export const idOrSlug = async (req: Request, res: Response, next: NextFunction) => {
  const idOrSlug = req.params.idOrSlug;

  console.log('hello!!', idOrSlug);
  let task = await TaskRepository.findOne({ where: { id: idOrSlug } });
  if (task) {
    req.params['id'] = idOrSlug;
    return next();
  }

  task = await TaskRepository.findOne({ where: { slug: idOrSlug } });
  if (task) {
    req.params['id'] = task.id;
    return next();
  } else {
    res.status(404).end();
  }
};
