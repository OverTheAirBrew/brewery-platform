import { registerAs } from '@nestjs/config';

interface IDbConfiguration {
  type: string;
  migrate: boolean;
}

interface ILocalDbConfiguration {
  type: 'local';
  database_name: string;
}

interface IMysqlDbConfiguration {
  type: 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export type DbConfiguration = IDbConfiguration &
  (ILocalDbConfiguration | IMysqlDbConfiguration);

export const DatabaseConfig = (): DbConfiguration => {
  const type = process.env.DATABASE_TYPE || 'local';

  if (type === 'local') {
    return {
      type: 'local',
      migrate: process.env.MIGRATE === 'true',
      database_name: process.env.SQLLITE_DATABASE_NAME || 'ota.homebrew.db',
    };
  }

  return {
    type: 'mysql',
    migrate: process.env.MIGRATE === 'true',
    host: process.env.MYSQL_HOST!,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    username: process.env.MYSQL_USERNAME!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
  };
};

export default registerAs<DbConfiguration>('DATABASE', () => DatabaseConfig());
