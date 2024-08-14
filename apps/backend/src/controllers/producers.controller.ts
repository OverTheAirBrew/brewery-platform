import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProducersDto, ProducersSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../id.response.dto';
import { ProducersService } from '../services/producer.service';
import { ZodBodyValidationPipe } from '../validation/validation.pipe';

@ApiTags('producers')
@Controller('/producers')
@ApiBearerAuth()
export class ProducersController {
  constructor(private producersService: ProducersService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @UsePipes(new ZodBodyValidationPipe(ProducersSchema))
  async createProducer(@Body() body: ProducersDto) {
    return this.producersService.createProducer(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: ProducersDto,
    isArray: true,
  })
  async getAllProducers() {
    return this.producersService.getAllProducers();
  }

  @Get('/:producerId')
  @ApiOkResponse({
    type: ProducersDto,
  })
  async getOneProducer(@Param('producerId') producerId: string) {
    return this.producersService.getOneProducer(producerId);
  }
}
