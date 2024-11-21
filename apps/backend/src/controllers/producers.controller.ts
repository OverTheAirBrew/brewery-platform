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
  CreateProducersRequest,
  CreateProducersRequestSchema,
  GetProducersResponse,
} from '@overtheairbrew/models';
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
  @UsePipes(new ZodBodyValidationPipe(CreateProducersRequestSchema))
  async createProducer(@Body() body: CreateProducersRequest) {
    return this.producersService.createProducer(body);
  }

  @Get('/')
  @ApiOkResponse({
    type: GetProducersResponse,
    isArray: true,
  })
  async getAllProducers() {
    return this.producersService.getAllProducers();
  }

  @Get('/:producerId')
  @ApiOkResponse({
    type: GetProducersResponse,
  })
  async getOneProducer(@Param('producerId') producerId: string) {
    return this.producersService.getOneProducer(producerId);
  }

  @Put('/:producerId')
  @UsePipes(new ZodBodyValidationPipe(CreateProducersRequestSchema))
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateProducer(
    @Param('producerId') producerId: string,
    @Body() body: CreateProducersRequest,
  ) {
    return this.producersService.updateProducer(producerId, body);
  }
}
