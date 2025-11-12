import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PluginModule } from '@overtheairbrew/nestjs-plugin-module';
import { AuthGuard } from './auth/auth.guard';
import databaseConfig from './data/data.config';
import { DataModule } from './data/data.module';
import { EventsModule } from './events/events.module';
import globalConfig from './global.config';
import { BeveragesModule } from './api/beverages/beverages.module';
import { DeviceTypesModule } from './api/device-types/device-types.module';
import { DisplaysModule } from './api/displays/displays.module';
import { KegsModule } from './api/kegs/kegs.module';
import { KeysModule } from './api/keys/keys.module';
import { ProducersModule } from './api/producers/producers.module';
import { TapsModule } from './api/taps/taps.module';
import { UsersModule } from './api/users/users.module';

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
    BeveragesModule,
    DeviceTypesModule,
    DisplaysModule,
    KegsModule,
    KeysModule,
    ProducersModule,
    TapsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useExisting: AuthGuard,
    },
    AuthGuard,
  ],
})
export class AppModule {}
