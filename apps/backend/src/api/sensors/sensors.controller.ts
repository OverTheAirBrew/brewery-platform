import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';
import { SensorDto, SensorSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../../id.response.dto';
import { SensorsService } from './sensors.service';

@ApiTags('sensors')
@Controller('/sensors')
export class SensorsController {
  constructor(private readonly sensorService: SensorsService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodBodyValidationPipe(SensorSchema))
  async createSensor(@Body() sensorDto: SensorDto) {
    return this.sensorService.createSensor(sensorDto);
  }
}
