import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PluginModule } from '@overtheairbrew/nestjs-plugin-module';
import { DeviceTypesController } from './controllers/device-types.controller';
import { DisplaysController } from './controllers/display.controller';
import { UsersController } from './controllers/users.controller';
import databaseConfig from './data/data.config';
import { DataModule } from './data/data.module';
import globalConfig from './global.config';
import { DeviceTypesService } from './services/device-types.service';

@Module({
  imports: [
    PluginModule.register(),
    DataModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, globalConfig],
    }),
  ],
  controllers: [DeviceTypesController, DisplaysController, UsersController],
  providers: [DeviceTypesService],
})
export class AppModule {}
