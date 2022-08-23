import { agent as request } from 'supertest';

import { FilePayload } from './payloads';

import { app } from '../../../index';

export const createFile = async (data: FilePayload) => {
  const { name, file } = data;  

  const res = await request(app).put('/v1/files').send(file);
  return res.body;
}