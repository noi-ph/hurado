import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Result } from 'orm/entities/submissions/Result';
import { Submission } from 'orm/entities/submissions/Submission';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
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
  const id = parseInt(req.params.id);

  const resultRepository = AppDataSource.getRepository(Result);
  const submissionRepository = AppDataSource.getRepository(Submission);
  try {
    if (errors.isEmpty) {
      const result = await resultRepository.findOne({ where: { id } });

      if (submissionId) {
        try {
          const submission = await submissionRepository.findOne({ where: { id: submissionId } });
          result.submission = submission;
          result.submissionId = submission.id;
        } catch (err) {
          errors.put('submission', `Submission ${submissionId} not found`);
        }
      }

      if (verdict) {
        result.verdict = verdict;
      }

      if (runningTime !== null) {
        result.runningTime = runningTime;
      }

      if (runningMemory !== null) {
        result.runningMemory = runningMemory;
      }

      if (rawScore !== null) {
        result.rawScore = rawScore;
      }

      if (isOfficial !== null) {
        result.isOfficial = isOfficial;
      }

      if (compileTime !== null) {
        result.compileTime = compileTime;
      }

      if (compileMemory !== null) {
        result.compileMemory = compileMemory;
      }

      if (createdAt) {
        result.createdAt = createdAt;
      }

      if (verdictGottenAt) {
        result.verdictGottenAt = verdictGottenAt;
      }

      if (errors.isEmpty) {
        await resultRepository.save(result);
        res.customSuccess(200, 'Result successfully edited', result);
      } else {
        const customError = new CustomError(400, 'Validation', 'Result cannot be edited', null, errors);
        return next(customError);
      }
    } else {
      const customError = new CustomError(400, 'Validation', 'Result cannot be edited', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}