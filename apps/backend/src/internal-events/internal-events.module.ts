import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CustomQueue } from './internal-events.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigType } from '../config';

@Global()
@Module({})
export class InternalEventsModule {
  static register(queueName: string | symbol): DynamicModule {
    const queueNameStr =
      typeof queueName === 'symbol' ? queueName.toString() : queueName;

    return {
      module: InternalEventsModule,
      providers: [
        {
          provide: queueName,
          useFactory: (configService: ConfigService) => {
            const config = configService.get<ConfigType>('CONFIG');
            return new CustomQueue(queueNameStr, {
              connection: {
                url: config!.redis.REDIS_URL,
                keyPrefix: config?.redis.REDIS_PREFIX || undefined,
              },
            });
          },
          inject: [ConfigService],
        },
      ],
      imports: [
        BullModule.registerQueueAsync({
          name: queueNameStr,
          useFactory: async (configService: ConfigService) => {
            const config = configService.get<ConfigType>('CONFIG');
            return {
              defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
              },
              connection: {
                url: config!.redis.REDIS_URL,
                keyPrefix: config?.redis.REDIS_PREFIX || undefined,
              },
            };
          },
          inject: [ConfigService],
        }),
      ],
      exports: [queueName],
    };
  }
}
