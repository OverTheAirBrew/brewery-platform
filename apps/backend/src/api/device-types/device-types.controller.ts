import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DeviceTypesDto } from '@overtheairbrew/models';
import { DeviceTypesService } from './device-types.service';

@ApiTags('device-types')
@Controller('/device-types')
@ApiBearerAuth()
export class DeviceTypesController {
  constructor(private deviceTypesService: DeviceTypesService) {}

  @Get('/')
  @ApiOkResponse({
    type: DeviceTypesDto,
  })
  async get() {
    return await this.deviceTypesService.getAll();
  }
}
