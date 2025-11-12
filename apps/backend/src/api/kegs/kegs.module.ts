import { Module } from '@nestjs/common';
import { KegsService } from './kegs.service';
import { KegsController } from './keg.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [KegsService],
  controllers: [KegsController],
  imports: [DataModule],
})
export class KegsModule {}
