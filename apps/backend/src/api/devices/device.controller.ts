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
import {
  SingleUseCodeExchangeSchema,
  SingleUseCodeExchangeDto,
  SingleUseCodeExchangeResponseDto,
} from '@overtheairbrew/models';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';
import { DeviceDto, DeviceSchema } from '@overtheairbrew/models';
import { DeviceService } from './device.service';
import { IdResponseDto } from '../../id.response.dto';
import { Public } from '../../auth/public.decorator';

/* istanbul ignore start */
@ApiTags('devices')
@Controller('/devices')
export class DevicesController {
  /* istanbul ignore stop */
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

  @Get('/sensor-types')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      additionalProperties: true, // Tells Swagger it's a dynamic JSON schema object
    },
  })
  async getSensorTypes() {
    return this.deviceService.getAllSensorTypes();
  }

  @Get('/actor-types')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    schema: {
      type: 'object',
      additionalProperties: true, // Tells Swagger it's a dynamic JSON schema object
    },
  })
  async getActorTypes() {
    return this.deviceService.getAllActorTypes();
  }

  @Post('/:device_id/refresh-code')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  async generateCode(@Param('device_id') deviceId: string) {
    return this.deviceService.refreshCode(deviceId);
  }

  @Post('/exchange-code')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: SingleUseCodeExchangeResponseDto,
  })
  @Public()
  @UsePipes(new ZodBodyValidationPipe(SingleUseCodeExchangeSchema))
  async exchangeSingleUseCode(@Body() body: SingleUseCodeExchangeDto) {
    return this.deviceService.exchangeSingleUseCode(body.code);
  }
}
