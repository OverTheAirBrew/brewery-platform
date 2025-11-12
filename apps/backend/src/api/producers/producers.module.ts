import { Module } from '@nestjs/common';
import { ProducersService } from './producer.service';
import { ProducersController } from './producers.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [ProducersService],
  controllers: [ProducersController],
  imports: [DataModule],
})
export class ProducersModule {}
