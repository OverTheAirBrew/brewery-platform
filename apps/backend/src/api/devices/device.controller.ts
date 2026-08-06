import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';
import {
  ActorTypeDto,
  DeviceDto,
  DeviceSchema,
  SensorDto,
  SensorSchema,
  SensorTypeDto,
} from '@overtheairbrew/models';
import { DeviceService } from './device.service';
import { IdResponseDto } from '../../id.response.dto';

@ApiTags('devices')
@Controller('/devices')
export class DevicesController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodBodyValidationPipe(DeviceSchema))
  async createDevice(@Body() deviceDto: DeviceDto) {
    return this.deviceService.createDevice(deviceDto);
  }

  @Get('/:id/sensor-types')
  @ApiOkResponse({
    type: SensorTypeDto,
    isArray: true,
  })
  async getSensorsTypesForDeviceId(@Param('id') id: string) {
    return this.deviceService.getSensorTypesForDeviceId(id);
  }

  @Get('/:id/actor-types')
  @ApiOkResponse({
    type: ActorTypeDto,
    isArray: true,
  })
  async getActorTypesForDeviceId(@Param('id') id: string) {
    return this.deviceService.getActorTypesForDeviceId(id);
  }
}
