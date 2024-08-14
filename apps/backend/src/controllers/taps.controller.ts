import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TapDto, TapSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../id.response.dto';
import { TapsService } from '../services/taps.service';
import { ZodBodyValidationPipe } from '../validation/validation.pipe';

@ApiTags('taps')
@Controller('/taps')
@ApiBearerAuth()
export class TapsController {
  constructor(private tapsService: TapsService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodBodyValidationPipe(TapSchema))
  async createTap(@Body() body: TapDto) {
    return this.tapsService.createTap(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: TapDto,
    isArray: true,
  })
  async getAllTaps() {
    return this.tapsService.getAllTaps();
  }

  @Get('/:tapId')
  @ApiOkResponse({
    type: TapDto,
  })
  async getOneTap(@Param('tapId') tapId: string) {
    return this.tapsService.getOneTap(tapId);
  }
}
