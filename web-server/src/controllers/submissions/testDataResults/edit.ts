import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Result } from 'orm/entities/submissions/Result';
import { TestDataResult } from 'orm/entities/submissions/TestDataResult';
import { TestData } from 'orm/entities/tasks/TestData';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const id = parseInt(req.params.id);

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
    const testDataResult = await testDataResultRepository.findOne({ where: { id } });

    if (resultId) {
      try {
        const result = await resultRepository.findOne({ where: { id: resultId } });
        testDataResult.result = result;
        testDataResult.resultId = result.id;
      } catch (err) {
        errors.put('result', `Result id ${resultId} not found`);
      }
    }

    if (testDataId) {
      try {
        const subtask = await testDataRepository.findOne({ where: { id: testDataId } });
        testDataResult.testData = subtask;
        testDataResult.testDataId = subtask.id;
      } catch (err) {
        errors.put('subtask', `Test data ${testDataId} not found`);
      }
    }
    
    if (verdict) {
      testDataResult.verdict = verdict;
    }

    if (runningTime !== null) {
      testDataResult.runningTime = runningTime;
    }

    if (runningMemory !== null) {
      testDataResult.runningMemory = runningMemory;
    }

    if (rawScore !== null) {
      testDataResult.rawScore = rawScore;
    }
    
    if (verdictGottenAt) {
      testDataResult.verdictGottenAt = verdictGottenAt;
    }

    if (errors.isEmpty) {
      await testDataResultRepository.save(testDataResult);
      res.customSuccess(200, 'Test data result successfully edited', testDataResult);
    } else {
      const customError = new CustomError(400, 'Validation', 'Test data result cannot be edited', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}