import { Module } from '@nestjs/common';
import { BeveragesService } from './beverages.service';
import { BeveragesController } from './beverages.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [BeveragesService],
  controllers: [BeveragesController],
  imports: [DataModule],
})
export class BeveragesModule {}
