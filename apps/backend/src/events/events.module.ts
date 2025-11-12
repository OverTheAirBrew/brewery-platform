import { Global, Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { EventsGateway } from './events.gateway';
import { KeysService } from '../api/keys/keys.service';

@Global()
@Module({
  providers: [EventsGateway, KeysService],
  imports: [DataModule],
  exports: [EventsGateway],
})
export class EventsModule {}
