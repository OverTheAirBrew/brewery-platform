import {
  ZodValidationPipe,
  ZodSerializerInterceptor,
  ZodSerializationException,
} from 'nestjs-zod';
import {
  APP_PIPE,
  APP_INTERCEPTOR,
  APP_FILTER,
  BaseExceptionFilter,
} from '@nestjs/core';
import { ZodError } from 'zod';
import {
  Module,
  HttpException,
  ArgumentsHost,
  Logger,
  Catch,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
// import { PluginModule } from '@overtheairbrew/nestjs-plugin-module';
import { AuthGuard } from './auth/auth.guard';
import config, { ConfigType } from './config';
import { DataModule } from './data/data.module';
import { EventsModule } from './events/events.module';
import { DeviceTypesModule } from './api/device-types/device-types.module';
import { KeysModule } from './api/keys/keys.module';
import { UsersModule } from './api/users/users.module';

import { HealthController } from './api/health/health.controller';
import { TelemetryModule } from './api/telemetry/telemetry.module';
import { DevicesModule } from './api/devices/device.module';
import { SensorsModule } from './api/sensors/sensors.module';
import { ProcessorsModule } from './processors/processors.module';
import { PluginsModule } from './plugins/plugins.module';
import { MqttClientModule } from './mqtt-client/mqtt-client.module';
import { LogicTypesModule } from './api/logic-types/logic-types.module';
import { ActorTypesModule } from './api/actor-types/actor-types.module';
import { VesselsModule } from './api/vessels/vessels.module';
import { ActorsModule } from './api/actors/actors.module';

import { BullModule } from '@nestjs/bullmq';

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
      }
    }

    super.catch(exception, host);
  }
}

@Module({
  imports: [
    MqttClientModule,
    PluginsModule.register(),
    DataModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('PRIVATE_KEY'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    EventsModule,
    DeviceTypesModule,
    KeysModule,
    UsersModule,
    TelemetryModule,
    DevicesModule,
    SensorsModule,
    ProcessorsModule,
    LogicTypesModule,
    ActorTypesModule,
    VesselsModule,
    ActorsModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useExisting: AuthGuard,
    },
    AuthGuard,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
