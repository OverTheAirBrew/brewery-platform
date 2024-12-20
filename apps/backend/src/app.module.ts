import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { PluginModule } from '@overtheairbrew/nestjs-plugin-module';
import { AuthGuard } from './auth/auth.guard';
import { BeveragesController } from './controllers/beverages.controller';
import { DeviceTypesController } from './controllers/device-types.controller';
import { DisplaysController } from './controllers/displays.controller';
import { KegsController } from './controllers/keg.controller';
import { ProducersController } from './controllers/producers.controller';
import { SseController } from './controllers/sse.controller';
import { TapsController } from './controllers/taps.controller';
import { UsersController } from './controllers/users.controller';
import databaseConfig from './data/data.config';
import { DataModule } from './data/data.module';
import globalConfig, { IGlobalConfig } from './global.config';
import { GqlModule } from './resolvers/gql.module';
import { BeveragesService } from './services/beverages.service';
import { DeviceTypesService } from './services/device-types.service';
import { DisplaysService } from './services/displays.service';
import { KegsService } from './services/kegs.service';
import { ProducersService } from './services/producer.service';
import { TapsService } from './services/taps.service';
import { UsersService } from './services/users.service';
import { SseService } from './sse/sse.service';

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
    EventEmitterModule.forRoot(),
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const globalConfig = configService.get<IGlobalConfig>('GLOBAL');

        return {
          dest: globalConfig!.uploadDirectory,
        };
      },
      inject: [ConfigService],
    }),
    GqlModule,
  ],
  controllers: [
    DeviceTypesController,
    DisplaysController,
    UsersController,
    ProducersController,
    BeveragesController,
    KegsController,
    TapsController,
    SseController,
  ],
  providers: [
    SseService,
    DeviceTypesService,
    DisplaysService,
    UsersService,
    ProducersService,
    BeveragesService,
    KegsService,
    TapsService,
    {
      provide: 'APP_GUARD',
      useExisting: AuthGuard,
    },
    AuthGuard,
  ],
})
export class AppModule {}
