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
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { UseApiKey } from '../auth/api-key.decorator';
import { IdResponseDto } from '../id.response.dto';

import {
  DisplayDto,
  DisplaySchema,
  DisplayTapInformationDto,
} from '@overtheairbrew/models';
import { DisplaysService } from '../services/displays.service';
import { ZodBodyValidationPipe } from '../validation/validation.pipe';

@ApiTags('displays')
@Controller('/displays')
export class DisplaysController {
  constructor(private readonly displaysService: DisplaysService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodBodyValidationPipe(DisplaySchema))
  @ApiBearerAuth()
  async createDisplay(@Body() body: DisplayDto) {
    return await this.displaysService.createDisplay(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: DisplayDto,
    isArray: true,
  })
  @ApiBearerAuth()
  async getDisplays() {
    return await this.displaysService.getDisplays();
  }

  @Get('/:displayCode/tap-information')
  @ApiOkResponse({
    type: DisplayTapInformationDto,
  })
  @ApiBearerAuth()
  @UseApiKey()
  @ApiSecurity('api_key')
  async getDisplayInformation(@Param('displayCode') displayCode: string) {
    return await this.displaysService.getDisplayInformationByCode(displayCode);
  }

  @Put('/:displayId')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UsePipes(new ZodBodyValidationPipe(DisplaySchema))
  async updateDisplay(
    @Param('displayId') displayId: string,
    @Body() body: DisplayDto,
  ) {
    return await this.displaysService.updateDisplay(displayId, body);
  }
}
