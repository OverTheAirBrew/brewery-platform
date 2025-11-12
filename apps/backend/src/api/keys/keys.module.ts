import { Module } from '@nestjs/common';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [KeysService],
  controllers: [KeysController],
  imports: [DataModule],
  exports: [KeysService],
})
export class KeysModule {}
