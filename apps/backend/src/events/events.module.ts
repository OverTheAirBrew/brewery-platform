import { Global, Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { EventsGateway } from './events.gateway';
import { ApiKeysService } from '../api/api-keys/api-keys.service';

@Global()
@Module({
  providers: [EventsGateway, ApiKeysService],
  imports: [DataModule],
  exports: [EventsGateway],
})
export class EventsModule {}
