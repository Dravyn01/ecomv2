import { DataSource } from 'typeorm';
import * as entities from './entities.config';
import { DB_CONFIG } from './db.config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  entities: Object.values(entities) as Function[],
  migrations: ['src/migrations/*.ts'],
  ...DB_CONFIG,
});
