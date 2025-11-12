import { Module } from '@nestjs/common';
import { LogicTypesService } from './logic-types.service';
import { LogicTypesController } from './logic-types.controller';

@Module({
  providers: [LogicTypesService],
  controllers: [LogicTypesController],
  exports: [LogicTypesService],
})
export class LogicTypesModule {}
