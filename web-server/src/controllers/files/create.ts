import { AppDataSource } from 'orm/data-source';
import { File } from 'orm/entities/files/File';

export const create = async (rawFile: Express.Multer.File) => { 
  const fileRepository = AppDataSource.getRepository(File);
  const file = new File();

  file.fileUrl = rawFile.path;
  file.name = rawFile.originalname;
  await fileRepository.save(file);

  return file;
};
