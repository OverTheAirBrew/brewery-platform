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
import { BeverageDto, BeverageSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../../id.response.dto';
import { BeveragesService } from './beverages.service';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';

@ApiTags('beverages')
@Controller('/beverages')
@ApiBearerAuth()
export class BeveragesController {
  constructor(private beveragesService: BeveragesService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodBodyValidationPipe(BeverageSchema))
  async createBeverage(@Body() body: BeverageDto) {
    return this.beveragesService.createBeverage(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: BeverageDto,
    isArray: true,
  })
  async getAllBeverages() {
    return this.beveragesService.getAllBeverages();
  }

  @Get('/:beverageId')
  @ApiOkResponse({
    type: BeverageDto,
  })
  async getOneBeverage(@Param('beverageId') beverageId: string) {
    return this.beveragesService.getOneBeverage(beverageId);
  }

  @Put('/:beverageId')
  @ApiNoContentResponse()
  @UsePipes(new ZodBodyValidationPipe(BeverageSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBeverage(
    @Param('beverageId') beverageId: string,
    @Body() body: BeverageDto,
  ) {
    return this.beveragesService.updateBeverage(beverageId, body);
  }
}
