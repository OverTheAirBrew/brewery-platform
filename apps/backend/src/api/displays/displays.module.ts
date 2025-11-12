import { Module } from '@nestjs/common';
import { DisplaysService } from './displays.service';
import { DisplaysController } from './displays.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [DisplaysService],
  controllers: [DisplaysController],
  imports: [DataModule],
})
export class DisplaysModule {}
