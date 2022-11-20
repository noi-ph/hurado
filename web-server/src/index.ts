import 'dotenv/config';
import 'reflect-metadata';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import routes from 'routes';

export const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

try {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
} catch (e) {
  console.log(e);
}

app.use('/', routes);

(async () => {
  try {
    console.log('Database connection initialized successfully');
  } catch (e) {
    console.warn('Database connection failed initializing');
    console.warn(e);
  }
})();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
