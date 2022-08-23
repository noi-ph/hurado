import { agent as request } from 'supertest';

import { createFile } from './createFile';
import { ScriptPayload } from './payloads';

import { app } from '../../../index';

export const createScript = async (data: ScriptPayload) => {
  const { file, languageCode, runtimeArgs } = data;

  const createdFile = await createFile(file);
  const res = await request(app).post('/v1/scripts').send({ file: createdFile, languageCode, runtimeArgs });
  return res.body;
}