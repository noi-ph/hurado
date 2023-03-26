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

import 'express-async-errors';
import 'reflect-metadata';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { handleInternalServerError } from 'middleware/errors/internal_server_error';
import { handleValidationError } from 'middleware/errors/validation_error';
import { AppDataSourceInitialization } from 'orm/repositories';
import routes from 'routes';

export const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

app.use('/', routes);
app.use(handleValidationError);
app.use(handleInternalServerError);

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
