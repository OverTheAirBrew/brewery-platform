import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
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

  @Put('/:kegId')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ZodBodyValidationPipe(KegSchema))
  async updateKeg(@Param('kegId') kegId: string, @Body() body: KegDto) {
    return await this.kegsService.updateKeg(kegId, body);
  }
}
