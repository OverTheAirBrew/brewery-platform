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
import {
  CreateKegRequest,
  CreateKegRequestSchema,
  GetKegResponse,
} from '@overtheairbrew/models';
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
  @UsePipes(new ZodBodyValidationPipe(CreateKegRequestSchema))
  async createKeg(@Body() body: CreateKegRequest) {
    return this.kegsService.createKeg(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: GetKegResponse,
    isArray: true,
  })
  async getAllKegs() {
    return await this.kegsService.getAllKegs();
  }

  @Get('/:kegId')
  @ApiOkResponse({
    type: GetKegResponse,
  })
  async getOneKeg(@Param('kegId') kegId: string) {
    return await this.kegsService.getOneKeg(kegId);
  }

  @Put('/:kegId')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ZodBodyValidationPipe(CreateKegRequestSchema))
  async updateKeg(
    @Param('kegId') kegId: string,
    @Body() body: CreateKegRequest,
  ) {
    return await this.kegsService.updateKeg(kegId, body);
  }
}
