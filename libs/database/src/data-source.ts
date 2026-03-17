import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const rootDir = path.resolve(__dirname, '../../..');

// Use TypeScript entities when running in dev (ts-node), otherwise use compiled JavaScript
const entitiesPath =
  process.env.NODE_ENV === 'production'
    ? [
        path.join(rootDir, 'dist/apps/**/*.entity.js'),
        path.join(rootDir, 'dist/libs/**/*.entity.js'),
      ]
    : [
        path.join(rootDir, 'apps/**/*.entity.{ts,js}'),
        path.join(rootDir, 'libs/**/*.entity.{ts,js}'),
      ];

const migrationsPath =
  process.env.NODE_ENV === 'production'
    ? [path.join(rootDir, 'dist/libs/database/src/migrations/*.js')]
    : [__dirname + '/migrations/*.{ts,js}'];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'nest_proptech',
  entities: entitiesPath,
  migrations: migrationsPath,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
