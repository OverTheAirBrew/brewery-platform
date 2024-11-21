import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';
import { IGlobalConfig } from '../global.config';
import { DbConfiguration } from './data.config';
import { ApiKey } from './entities/api-key.entity';
import { Beverage } from './entities/beverage.entity';
import { DisplayLogin } from './entities/display-logins';
import { Display } from './entities/display.entity';
import { Image } from './entities/image.entity';
import { Keg } from './entities/keg.entity';
import { Producer } from './entities/producer.entity';
import { Tap } from './entities/tap.entity';

const DatabaseModels: ModelCtor[] = [
  Display,
  Beverage,
  Producer,
  Keg,
  Tap,
  ApiKey,
  DisplayLogin,
  Image,
];

export const createSequelizeInstance = async (
  config: DbConfiguration,
  homeDirectory: string,
) => {
  const logger = new Logger('Database');

  logger.log(`Using ${config.type} database`);

  if (config.type === 'mysql') {
    return new Sequelize({
      dialect: 'mysql',
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      models: DatabaseModels,
      dialectOptions: { decimalNumbers: true },
      logging: logger.debug,
    });
  }

  return new Sequelize({
    dialect: 'sqlite',
    storage: join(homeDirectory, config.database_name),
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
    const databaseConfig = configService.get<DbConfiguration>('DATABASE');
    const globalConfig = configService.get<IGlobalConfig>('GLOBAL');

    const sequelizeInstance = await createSequelizeInstance(
      databaseConfig!,
      globalConfig!.dataDirectory,
    );

    if (databaseConfig!.migrate) {
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
