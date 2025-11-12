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
import { VesselDto, VesselSchema } from '@overtheairbrew/models';
import { VesselsService } from './vessels.service';
import { IdResponseDto } from '../../id.response.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { VesselProcess } from '../../internal-events/events/vessel-process';
import { MqttService } from '../../mqtt-client/mqtt-client.service';
import { Processor } from '@nestjs/bullmq';

@ApiTags('vessels')
@Controller('/vessels')
export class VesselsController {
  constructor(
    private readonly vesselsService: VesselsService,
    private readonly mqttService: MqttService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodBodyValidationPipe(VesselSchema))
  async createVessel(@Body() body: VesselDto) {
    const response = await this.vesselsService.createVessel(body);
    return response;
  }

  @Post('/:vessel_id/auto-control')
  @HttpCode(HttpStatus.NO_CONTENT)
  async enableAutoControl(
    @Body() body: { enabled: boolean },
    @Param('vessel_id') vessel_id: string,
  ) {
    await this.vesselsService.setAutoControl(vessel_id, body.enabled);
  }

  // // @OnEvent('vessel.process')
  // @Processor('logic-processing')
  // async handleVesselProcessEvent(event: VesselProcess) {
  //   await this.vesselsService.processLogic(event);
  // }
}
