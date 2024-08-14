import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BeverageDto, BeverageSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../id.response.dto';
import { BeveragesService } from '../services/beverages.service';
import { ZodValidationPipe } from '../validation/validation.pipe';

@ApiTags('beverages')
@Controller('/beverages')
@ApiBearerAuth()
export class BeveragesController {
  constructor(private beveragesService: BeveragesService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodValidationPipe(BeverageSchema))
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
}
