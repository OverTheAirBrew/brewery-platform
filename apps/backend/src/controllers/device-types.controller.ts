import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DeviceTypeResponseDto } from '../models/device-type-response.dto';
import { DeviceTypesService } from '../services/device-types.service';

@ApiTags('device-types')
@Controller('/device-types')
export class DeviceTypesController {
  constructor(private deviceTypesService: DeviceTypesService) {}

  @Get('/')
  @ApiOkResponse({
    type: DeviceTypeResponseDto,
  })
  async get() {
    return await this.deviceTypesService.getAll();
  }

  @Get('/test')
  async test() {
    return {
      hello: 'world',
    };
  }
}
