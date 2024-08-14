import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { KegDto, KegSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../id.response.dto';
import { KegsService } from '../services/kegs.service';
import { ZodBodyValidationPipe } from '../validation/validation.pipe';

@ApiTags('kegs')
@Controller('/kegs')
@ApiBearerAuth()
export class KegsController {
  constructor(private readonly kegsService: KegsService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodBodyValidationPipe(KegSchema))
  async createKeg(@Body() body: KegDto) {
    return this.kegsService.createKeg(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: KegDto,
    isArray: true,
  })
  async getAllKegs() {
    return await this.kegsService.getAllKegs();
  }

  @Get('/:kegId')
  @ApiOkResponse({
    type: KegDto,
  })
  async getOneKeg(@Param('kegId') kegId: string) {
    return await this.kegsService.getOneKeg(kegId);
  }
}
