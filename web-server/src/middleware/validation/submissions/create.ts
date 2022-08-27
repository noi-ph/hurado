import validator from "validator";
import { NextFunction, Request, Response } from "express";
import { Equal } from "typeorm";

import { ServerAPI } from "types";
import { AppDataSource } from "orm/data-source";
import { Contest, Participation, Task, User } from "orm/entities";

export const validationSubmission = async (req: Request, res: Response, next: NextFunction) => {
  let { languageCode, contestId } = req.body as ServerAPI['SubmissionPayload'];

  const task = await AppDataSource.getRepository(Task).findOne({ 
    where: { id: req.params.id } 
  });
  
  if (!task) {
    res.status(404).end();
    return;
  }

  const user = await AppDataSource.getRepository(User).findOne({ 
    where: { id: req.jwtPayload.id }
  });

  if (!user && !task.isPublicInArchive) {
    res.status(403).end();
    return;
  }

  if (contestId) {
    const contests = AppDataSource.getRepository(Contest);
    const contest = await contests.findOne({ where: { id: contestId } });

    if (!contest || !user) {
      res.status(404).end();
      return;
    }

    const participation = await AppDataSource.getRepository(Participation).findOne({ where: { 
      user: Equal(user), 
      contest: Equal(contest) 
    } });

    if (!participation) {
      res.status(403).end();
      return;
    }
  }

  const err: ServerAPI['SubmissionError'] = {};

  if (validator.isEmpty(languageCode)) {
    err.languageCode = 'This field is required';
  }

  if (Object.keys(err).length) {
    res.status(400).json(err);
  } else {
    return next();
  }
};
