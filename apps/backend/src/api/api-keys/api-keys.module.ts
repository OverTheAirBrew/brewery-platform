import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { DataModule } from '../../data/data.module';

@Module({
  providers: [ApiKeysService],
  controllers: [ApiKeysController],
  imports: [DataModule],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
