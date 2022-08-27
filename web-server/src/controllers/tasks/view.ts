import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Task } from 'orm/entities/tasks/Task';

const allDetails = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const task = await AppDataSource.getRepository(Task).findOne({
    where: { id },
    relations: {
      owner: true,
      checkerScript: true,
      validatorScript: true,
      attachments: true,
      developers: true,
      testData: true,
      appearsIn: true,
      submissions: true,
      subtasks: true,
    },
  });
  res.status(200).send(task);
};

const notAllDetails = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const task = await AppDataSource.getRepository(Task).findOne({ where: { id } });
  res.status(200).send(task);
};

export const viewTask = (showAllDetails: boolean) => {
  if (showAllDetails) {
    return allDetails;
  } else {
    return notAllDetails;
  }
};
