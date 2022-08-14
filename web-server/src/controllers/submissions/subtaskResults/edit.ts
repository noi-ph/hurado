import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Result } from 'orm/entities/submissions/Result';
import { SubtaskResult } from 'orm/entities/submissions/SubtaskResult';
import { Subtask } from 'orm/entities/tasks/Subtask';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

  const {
    resultId,
    subtaskId,
    verdict,
    runningTime,
    runningMemory,
    rawScore,
    verdictGottenAt,
  } = req.body;

  const resultRepository = AppDataSource.getRepository(Result);
  const subtaskResultRepository = AppDataSource.getRepository(SubtaskResult);
  const subtaskRepository = AppDataSource.getRepository(Subtask);
  try {
    const subtaskResult = await subtaskResultRepository.findOne({ where: { id } });

    if (resultId) {
      try {
        const result = await resultRepository.findOne({ where: { id: resultId } });
        subtaskResult.result = result;
        subtaskResult.resultId = result.id;
      } catch (err) {
        errors.put('result', `Result id ${resultId} not found`);
      }
    }

    if (subtaskId) {
      try {
        const subtask = await subtaskRepository.findOne({ where: { id: subtaskId } });
        subtaskResult.subtask = subtask;
        subtaskResult.subtaskId = subtask.id;
      } catch (err) {
        errors.put('subtask', `Subtask ${subtaskId} not found`);
      }
    }
    
    if (verdict) {
      subtaskResult.verdict = verdict;
    }

    if (runningTime !== null) {
      subtaskResult.runningTime = runningTime;
    }

    if (runningMemory !== null) {
      subtaskResult.runningMemory = runningMemory;
    }

    if (rawScore !== null) {
      subtaskResult.rawScore = rawScore;
    }
    
    if (verdictGottenAt) {
      subtaskResult.verdictGottenAt = verdictGottenAt;
    }

    if (errors.isEmpty) {
      await subtaskResultRepository.save(subtaskResult);
      res.customSuccess(200, 'Submission result successfully edited', subtaskResult);
    } else {
      const customError = new CustomError(400, 'Validation', 'Submission result cannot be edited', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}