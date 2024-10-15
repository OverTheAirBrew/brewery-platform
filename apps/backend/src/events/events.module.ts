import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { ApiKeyService } from '../services/api-key.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway, ApiKeyService],
  imports: [DataModule],
  exports: [EventsGateway],
})
export class EventsModule {}
