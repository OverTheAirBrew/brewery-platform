import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';
import {
  DeviceDto,
  DeviceSchema,
  SensorDto,
  SensorSchema,
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
}
