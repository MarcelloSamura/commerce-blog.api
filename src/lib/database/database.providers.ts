import { DataSource, type DataSourceOptions } from 'typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { SeederOptions } from 'typeorm-extension';
import * as path from 'path';

import { ENV_VARIABLES } from '../../config/env.config';

import { MainSeeder } from './seeds/main.seed';

export const entitiesPath = path.resolve(
  __dirname,
  '../../**/*.entity{.ts,.js}',
);

export const migrationsPath = path.resolve(
  __dirname,
  '../../lib/database/migrations/{*.ts,*.js}',
);

const isLocal = ENV_VARIABLES.DATABASE_HOST === 'localhost';

export type Options = DataSourceOptions & SeederOptions & TypeOrmModuleOptions;

export const options: Options = {
  type: 'postgres',
  port: ENV_VARIABLES.DB_PORT,
  username: ENV_VARIABLES.DB_USER,
  password: ENV_VARIABLES.DATABASE_ROOT_PASSWORD,
  database: ENV_VARIABLES.DATABASE_DATABASE_NAME,
  host: ENV_VARIABLES.DATABASE_HOST,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
  logging: isLocal,
  ssl: !isLocal,
  seeds: [MainSeeder],
};

export const AppDataSource = new DataSource(options);
