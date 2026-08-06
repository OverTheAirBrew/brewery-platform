import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DeviceTypeDto } from '@overtheairbrew/models';
import { DeviceTypesService } from './device-types.service';

@ApiTags('device-types')
@Controller('/device-types')
@ApiBearerAuth()
export class DeviceTypesController {
  constructor(private deviceTypesService: DeviceTypesService) {}

  @Get('/')
  @ApiOkResponse({
    type: DeviceTypeDto,
  })
  async get() {
    return await this.deviceTypesService.getAll();
  }
}
