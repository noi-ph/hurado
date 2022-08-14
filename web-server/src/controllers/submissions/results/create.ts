import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Result } from 'orm/entities/submissions/Result';
import { Submission } from 'orm/entities/submissions/Submission';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const {
    submissionId,
    verdict,
    runningTime,
    runningMemory,
    rawScore,
    isOfficial,
    compileTime,
    compileMemory,
    createdAt,
    verdictGottenAt
  } = req.body;

  const resultRepository = AppDataSource.getRepository(Result);
  const submissionRepository = AppDataSource.getRepository(Submission);
  try {
    const result = new Result();

    try {
      const submission = await submissionRepository.findOne({ where: { id: submissionId } });
      result.submission = submission;
      result.submissionId = submission.id;
    } catch (err) {
      errors.put('submission', `Submission ${submissionId} not found`);
    }

    result.verdict = verdict;
    result.runningTime = runningTime;
    result.runningMemory = runningMemory;
    result.rawScore = rawScore;
    result.isOfficial = isOfficial;
    result.compileTime = compileTime;
    result.compileMemory = compileMemory;
    result.createdAt = createdAt;
    result.verdictGottenAt = verdictGottenAt;

    if (errors.isEmpty) {
      await resultRepository.save(result);
      res.customSuccess(200, 'Result successfully created', result);
    } else {
      const customError = new CustomError(400, 'Validation', 'Result cannot be created', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}