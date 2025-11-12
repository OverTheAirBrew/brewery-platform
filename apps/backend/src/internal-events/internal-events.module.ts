import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CustomQueue } from './internal-events.service';

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
          useFactory: () => {
            return new CustomQueue(queueNameStr);
          },
        },
      ],
      imports: [
        BullModule.registerQueue({
          name: queueNameStr,
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
          },
        }),
      ],
      exports: [queueName],
    };
  }
}
