import { Module } from '@nestjs/common';
import { TapsService } from './taps.service';
import { TapsController } from './taps.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [TapsService],
  controllers: [TapsController],
  imports: [DataModule],
})
export class TapsModule {}
