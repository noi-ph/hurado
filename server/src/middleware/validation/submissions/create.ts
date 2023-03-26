import validator from "validator";
import { NextFunction, Request, Response } from "express";
import { Equal } from "typeorm";

import { ServerAPI } from "types";
import { TaskRepository, UserRepository, ContestRepository, ParticipationRepository } from "orm/repositories";

export const validationSubmission = async (req: Request, res: Response, next: NextFunction) => {
  let { languageCode, contestId } = req.body as ServerAPI['SubmissionPayload'];

  const task = await TaskRepository.findOne({ 
    where: { id: req.params.id } 
  });
  
  if (!task) {
    res.status(404).end();
    return;
  }

  const user = await UserRepository.findOne({ 
    where: { id: req.jwtPayload.id }
  });

  if (!user && !task.isPublicInArchive) {
    res.status(403).end();
    return;
  }

  if (contestId) {
    const contest = await ContestRepository.findOne({ where: { id: contestId } });

    if (!contest || !user) {
      res.status(404).end();
      return;
    }

    const participation = await ParticipationRepository.findOne({ where: { 
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
