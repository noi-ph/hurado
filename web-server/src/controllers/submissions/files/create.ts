import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { File } from 'orm/entities/files/File';
import { Submission } from 'orm/entities/submissions/Submission';
import { SubmissionFile } from 'orm/entities/submissions/SubmissionFile';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorArray } from 'utils/response/custom-error/types';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  const errors = new ErrorArray();

  const { submissionId, fileId } = req.body;

  const fileRepository = AppDataSource.getRepository(File);
  const submissionRepository = AppDataSource.getRepository(Submission);
  const submissionFileRepository = AppDataSource.getRepository(SubmissionFile);
  try {
    const submissionFile = new SubmissionFile();

    try {
      const submission = await submissionRepository.findOne({ where: { id: submissionId } });
      submissionFile.submission = submission;
      submissionFile.submissionId = submission.id;
    } catch (err) {
      errors.put('submission', `Submission ${submissionId} not found`);
    }

    try {
      const file = await fileRepository.findOne({ where: { id: fileId } });
      submissionFile.file = file;
      submissionFile.fileId = file.id;
    } catch (err) {
      errors.put('submissionFile', `SubmissionFile ${fileId} not found`);
    }

    if (errors.isEmpty) {
      await submissionFileRepository.save(submissionFile);
      res.customSuccess(200, 'file successfully created', submissionFile);
    } else {
      const customError = new CustomError(400, 'Validation', 'file cannot be created', null, errors);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err, errors);
    return next(customError);
  }
}