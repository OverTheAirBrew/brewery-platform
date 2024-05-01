import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';
import { IGlobalConfig } from '../global.config';
import { DbConfiguration } from './data.config';
import { Display } from './entities/display.entity';

const DatabaseModels: ModelCtor[] = [Display];

export const createSequelizeInstance = async (
  config: DbConfiguration,
  homeDirectory: string,
) => {
  if (config.type === 'mysql') {
    return new Sequelize({
      dialect: 'mysql',
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
    });
  }

  return new Sequelize({
    dialect: 'sqlite',
    storage: join(homeDirectory, config.database_name),
    models: DatabaseModels,
    define: {
      timestamps: true,
    },
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
  const umzug = new Umzug({
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize,
    }),
    migrations: {
      glob: '**/migrations/*.js',
    },
    logger: console,
  });

  await umzug.up();
}
