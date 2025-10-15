import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import * as entities from './entities.config';

dotenv.config();

const config: DataSourceOptions = {
  type: 'postgres',
  entities: Object.values(entities) as Function[],
  migrations: ['dist/migrations/*.js'],
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'unknow_db',
  synchronize: true, // false if production
  logging: true,
};

// for typeorm cli and migration
export const AppDataSource = new DataSource(config);

// for nestjs
export const TypeOrmConfig: TypeOrmModuleOptions = {
  ...config,
};
