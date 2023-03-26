/* eslint-disable import/order */
import path from 'path';
import dotenv from 'dotenv';

const ENV_PATH = path.join(__dirname, `../config/${process.env.DOTENV}`);
console.log(`Loading environment from ${ENV_PATH}`);

dotenv.config({
  path: ENV_PATH,
  debug: process.env.DOTENV.includes('development'),
});
/* eslint-enable import/order */

import 'reflect-metadata';
import fs from 'fs';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppDataSourceInitialization } from 'orm/repositories';
import routes from 'routes';

export const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

try {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), {
    flags: 'a',
  });
  app.use(morgan('combined', { stream: accessLogStream }));
} catch (err) {
  console.log(err);
}
app.use(morgan('combined'));

app.use('/', routes);

const port = process.env.PORT || 4000;

(async () => {
  try {
    await AppDataSourceInitialization;
    console.log('Database connection initialized successfully');
  } catch (err) {
    console.warn('Database connection failed initializing');
    console.warn(err);
  }
})();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
