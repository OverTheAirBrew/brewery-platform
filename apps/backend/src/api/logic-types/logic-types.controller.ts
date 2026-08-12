import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LogicTypesDto } from '@overtheairbrew/models';
import { LogicTypesService } from './logic-types.service';

/* istanbul ignore start */
@ApiTags('logic-types')
@Controller('/logic-types')
@ApiBearerAuth()
export class LogicTypesController {
  /* istanbul ignore stop */
  constructor(private logicTypesService: LogicTypesService) {}

  @Get('/')
  @ApiOkResponse({
    type: LogicTypesDto,
  })
  async get() {
    return await this.logicTypesService.getAll();
  }
}
