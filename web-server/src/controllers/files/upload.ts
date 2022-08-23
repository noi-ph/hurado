import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { File } from 'orm/entities/files/File';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const upload = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    console.log(0);
    const rawFile = req.files[0];
    console.log(1)

    const fileRepository = AppDataSource.getRepository(File);
    const file = new File();
    file.fileUrl = rawFile.path;
    file.name = rawFile.originalname;
    await fileRepository.save(file);

    res.send(file);
    res.customSuccess(200, 'File successfully uploaded');

    console.log('mlem!');
  } catch (err) {
    console.log('mlerm...')
    const customError = new CustomError(400, 'Raw', 'Error', err);
    return next(customError);
  }
};
