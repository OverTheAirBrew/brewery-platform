import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PluginModule } from '@overtheairbrew/nestjs-plugin-module';
import { AuthGuard } from './auth/auth.guard';
import { ApiKeyController } from './controllers/api-key.controller';
import { BeveragesController } from './controllers/beverages.controller';
import { DeviceTypesController } from './controllers/device-types.controller';
import { DisplaysController } from './controllers/displays.controller';
import { KegsController } from './controllers/keg.controller';
import { ProducersController } from './controllers/producers.controller';
import { TapsController } from './controllers/taps.controller';
import { UsersController } from './controllers/users.controller';
import databaseConfig from './data/data.config';
import { DataModule } from './data/data.module';
import { EventsModule } from './events/events.module';
import globalConfig from './global.config';
import { ApiKeyService } from './services/api-key.service';
import { BeveragesService } from './services/beverages.service';
import { DeviceTypesService } from './services/device-types.service';
import { DisplaysService } from './services/displays.service';
import { KegsService } from './services/kegs.service';
import { ProducersService } from './services/producer.service';
import { TapsService } from './services/taps.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    PluginModule.register(),
    DataModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, globalConfig],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('PRIVATE_KEY'),
      }),
      inject: [ConfigService],
    }),
    EventsModule,
  ],
  controllers: [
    DeviceTypesController,
    DisplaysController,
    UsersController,
    ProducersController,
    BeveragesController,
    KegsController,
    TapsController,
    ApiKeyController,
  ],
  providers: [
    DeviceTypesService,
    DisplaysService,
    UsersService,
    ProducersService,
    BeveragesService,
    KegsService,
    TapsService,
    ApiKeyService,
    {
      provide: 'APP_GUARD',
      useExisting: AuthGuard,
    },
    AuthGuard,
  ],
})
export class AppModule {}
