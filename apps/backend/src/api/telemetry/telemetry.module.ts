import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { DataModule } from '../../data/data.module';
import { InternalEventsModule } from '../../internal-events/internal-events.module';
import { QUEUE_NAME } from './telemetry.abstractions';
import { TelemetryProcessor } from './telemetry.processor';

@Module({
  providers: [TelemetryService, TelemetryProcessor],
  imports: [DataModule, InternalEventsModule.register(QUEUE_NAME)],
})
export class TelemetryModule {}
