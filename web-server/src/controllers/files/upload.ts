import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { File } from 'orm/entities/files/File';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawFile = req.files[0];

    const fileRepository = AppDataSource.getRepository(File);
    try {
      const file = new File();
      file.fileURL = rawFile.path;
      file.name = rawFile.originalname;
      await fileRepository.save(file);

      res.send(file);
      res.customSuccess(200, 'File successfully uploaded');
    } catch (err) {
      const customError = new CustomError(400, 'General', 'Unable to create file', ['Unable to create file']);
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
