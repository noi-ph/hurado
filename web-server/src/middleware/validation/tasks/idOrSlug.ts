import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "orm/data-source";
import { Task } from "orm/entities";

export const idOrSlug = async (req: Request, res: Response, next: NextFunction) => {
  const taskRepository = AppDataSource.getRepository(Task);
  const idOrSlug = req.params.idOrSlug;

  let task = await taskRepository.findOne({ where: { id: idOrSlug } });
  if (task) {
    req.params['id'] = idOrSlug;
    return next();
  }

  task = await taskRepository.findOne({ where: { slug: idOrSlug } });
  if (task) {
    req.params['id'] = task.id;
    return next();
  } else {
    res.status(404).end();
  }
};
