import { Request, Response, NextFunction } from 'express';

import { UserRepository } from 'orm/repositories';

const allDetails = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const user = await UserRepository.findOne({
    where: { id },
    relations: {
      tasks: true,
      develops: true,
      submissions: true,
      contests: true,
      participations: true,
    },
  });

  if (!user) {
    res.status(404).end();
  } else {
    res.status(200).send(user);
  }
};

const notAllDetails = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const user = await UserRepository.findOne({ where: { id } });

  if (!user) {
    res.status(404).end();
  } else {
    res.status(200).send(user);
  }
};

export const show = (showAllDetails: boolean) => {
  if (showAllDetails) {
    return allDetails;
  } else {
    return notAllDetails;
  }
};
