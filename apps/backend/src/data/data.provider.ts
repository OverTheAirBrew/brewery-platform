import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';
import { ConfigType } from '../config';
import { REPOSITORY_ENTITIES } from './data.abstractions';

const DatabaseModels: ModelCtor[] = [
  ...REPOSITORY_ENTITIES.map((entry) => entry.useValue),
];

export const createSequelizeInstance = async (
  config: ConfigType,
  homeDirectory: string,
) => {
  const logger = new Logger('Database');

  logger.log(`Using ${config.database.DATABASE_TYPE} database`);

  if (config.database.DATABASE_TYPE === 'mysql') {
    const url = new URL(config.database.MYSQL_URL);

    return new Sequelize({
      dialect: 'mysql',
      host: url.hostname,
      port: parseInt(url.port),
      database: url.pathname.slice(1), // Remove leading slash from pathname
      username: url.username,
      password: url.password,
      models: DatabaseModels,
      dialectOptions: { decimalNumbers: true },
      logging: logger.debug,
    });
  }

  return new Sequelize({
    dialect: 'sqlite',
    storage: join(homeDirectory, config.database.DATABASE_NAME),
    models: DatabaseModels,
    define: {
      timestamps: true,
    },
    logging: logger.debug,
  });
};

export const databaseProvider: Provider = {
  provide: 'SEQUELIZE',
  useFactory: async (configService: ConfigService) => {
    const config = configService.get<ConfigType>('CONFIG');

    const sequelizeInstance = await createSequelizeInstance(
      config!,
      config!.global.DATA_DIRECTORY,
    );

    if (config!.database.MIGRATE) {
      await migrateDatabase(sequelizeInstance);
    }

    return sequelizeInstance;
  },
  inject: [ConfigService],
};

export async function migrateDatabase(sequelize: Sequelize) {
  const logger = new Logger('MigrateDatabase');
  logger.log('Migrating database schema.');

  const umzug = new Umzug({
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize,
    }),
    migrations: {
      glob: '**/migrations/*.js',
    },
    logger: {
      debug: logger.debug,
      info: logger.log,
      warn: logger.warn,
      error: logger.error,
    },
  });

  await umzug.up();
}
