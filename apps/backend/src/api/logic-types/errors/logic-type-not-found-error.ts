import { NotFoundException } from '@nestjs/common';

export class LogicTypeNotFoundError extends NotFoundException {
  constructor(logicTypeName: string) {
    super(`Logic type ${logicTypeName} not found`);
  }
}
