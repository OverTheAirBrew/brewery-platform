import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UseApiKey } from '../auth/api-key.decorator';
import { IdResponseDto } from '../id.response.dto';

import {
  DisplayDto,
  DisplayLoginDto,
  DisplaySchema,
  DisplayTapInformationDto,
  DisplayTapInformationUnauthenticatedDto,
} from '@overtheairbrew/models';
import { DisplayAllowed, Public } from '../auth/public.decorator';
import { DisplaysService } from '../services/displays.service';
import { SseService } from '../sse/sse.service';
import { ZodBodyValidationPipe } from '../validation/validation.pipe';

@ApiTags('displays')
@Controller('/displays')
export class DisplaysController {
  constructor(
    private readonly displaysService: DisplaysService,
    private readonly sseService: SseService,
  ) {}

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
  @DisplayAllowed()
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

  @Get('/:displayId/login-info')
  @ApiOkResponse({
    type: DisplayLoginDto,
  })
  async getDisplayLogin(@Param('displayId') displayId: string) {
    return await this.displaysService.getDisplayLogin(displayId);
  }

  @Post('/generate-login-qr')
  @ApiCreatedResponse({
    type: DisplayTapInformationUnauthenticatedDto,
  })
  @Public()
  async generateLoginQR(@Body() body: { serial: string; siteUrl: string }) {
    const data = await this.displaysService.generateLoginQr(
      body.serial,
      body.siteUrl,
    );

    return data;
  }

  @Post('/authenticate')
  @ApiNoContentResponse()
  async authenticateDisplay(@Body() body: { id: string }) {
    await this.displaysService.authenticateDisplay(body.id);
    return {};
  }

  @Get('/is-authenticated')
  @Public()
  // @ApiNoContentResponse()
  async isAuthenticated(@Query('id') id: string) {
    const isAuthd = await this.displaysService.isDisplayAuthenticated(id);
    return {
      isAuthd,
    };
  }
}
