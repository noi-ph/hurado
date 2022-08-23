import { ScriptPayload } from 'controllers/tasks/helpers/payloads';
import { AppDataSource } from 'orm/data-source';
import { Script } from 'orm/entities/scripts/Script';
import { create as createFile } from '../files';

export const create = async (data: ScriptPayload) => {
  const { file: fileData, languageCode, runtimeArgs } = data;
  const file = await createFile(fileData.file);

  const scriptRepository = AppDataSource.getRepository(Script);

  const script = new Script();
  script.file = file;
  script.fileId = file.id;
  script.languageCode = languageCode;
  script.runtimeArgs = runtimeArgs;
  await scriptRepository.save(script);

  return script;
};
