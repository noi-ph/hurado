import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Result } from 'orm/entities/submissions/Result';
import { TestDataResult } from 'orm/entities/submissions/TestDataResult';
import { TestData } from 'orm/entities/tasks/TestData';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const {
    resultId,
    testDataId,
    verdict,
    runningTime,
    runningMemory,
    rawScore,
    verdictGottenAt,
  } = req.body;

  const resultRepository = AppDataSource.getRepository(Result);
  const testDataResultRepository = AppDataSource.getRepository(TestDataResult);
  const testDataRepository = AppDataSource.getRepository(TestData);
  try {
    const subtaskResult = new TestDataResult();

    try {
      const result = await resultRepository.findOne({ where: { id: resultId } });
      subtaskResult.result = result;
      subtaskResult.resultId = result.id;
    } catch (err) {
      errors.put('result', `Result id ${resultId} not found`);
    }

    try {
      const subtask = await testDataRepository.findOne({ where: { id: testDataId } });
      subtaskResult.testData = subtask;
      subtaskResult.testDataId = subtask.id;
    } catch (err) {
      errors.put('subtask', `Test data ${testDataId} not found`);
    }

    subtaskResult.verdict = verdict;
    subtaskResult.runningTime = runningTime;
    subtaskResult.runningMemory = runningMemory;
    subtaskResult.rawScore = rawScore;
    subtaskResult.verdictGottenAt = verdictGottenAt;

    if (errors.isEmpty) {
      await testDataResultRepository.save(subtaskResult);
      res.customSuccess(200, 'Test data result successfully created', subtaskResult);
    } else {
      const customError = new CustomError(400, 'Validation', 'Test data result cannot be created', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}