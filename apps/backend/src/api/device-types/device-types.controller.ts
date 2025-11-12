import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DeviceTypeDto } from '@overtheairbrew/models';
import { DeviceTypesService } from './device-types.service';
import { Public } from '../../auth/public.decorator';

/* istanbul ignore start */
@ApiTags('device-types')
@Controller('/device-types')
@ApiBearerAuth()
export class DeviceTypesController {
  /* istanbul ignore stop */
  constructor(private deviceTypesService: DeviceTypesService) {}

  @Get('/')
  @ApiOkResponse({
    type: DeviceTypeDto,
  })
  async get() {
    return await this.deviceTypesService.getAll();
  }

  @Get('/testing')
  @Public()
  async testing() {
    return await this.deviceTypesService.testing();
  }
}
