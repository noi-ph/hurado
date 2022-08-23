import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from 'orm/data-source';
import { File } from 'orm/entities/files/File';

export const create = async (req: Request, res: Response, next: NextFunction) => { 
  const rawFile: Express.Multer.File = req.body;

  const fileRepository = AppDataSource.getRepository(File);
  const file = new File();

  file.fileUrl = rawFile.path;
  file.name = rawFile.originalname;
  await fileRepository.save(file);

  res.status(200).send(file);
};
