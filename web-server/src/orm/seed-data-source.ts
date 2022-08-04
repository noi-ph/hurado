import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { AppDataSource } from './data-source';

export const SeedDataSource = new DataSource({
  ...AppDataSource.options,
  migrations: ['src/orm/migrations/**/*.ts', 'src/orm/seeds/**/*.ts'],
});
