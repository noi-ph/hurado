import 'dotenv/config';
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import './utils/response/customSuccess';
import { AppDataSource } from 'orm/data-source';

import { errorHandler, errorInterceptor } from './middleware/errorHandler';
import routes from './routes';

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

app.use(errorInterceptor);
app.use(errorHandler);

const port = process.env.PORT || 4000;

(async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized successfully');
  } catch (err) {
    console.warn('Database connection failed initializing');
    console.warn(err);
  }
})();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
