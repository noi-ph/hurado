import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { Script } from 'orm/entities/scripts/Script';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, languageCode, runtimeArgs } = req.body;

    const scriptRepository = AppDataSource.getRepository(Script);

    const script = new Script();
    script.file = file;
    script.fileId = file.id;
    script.languageCode = languageCode;
    script.runtimeArgs = runtimeArgs;
    await scriptRepository.save(script);

    res.customSuccess(200, 'Script successfully screated', script);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', err);
    return next(customError);
  }
};
