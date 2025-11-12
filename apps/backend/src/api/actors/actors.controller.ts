import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ZodBodyValidationPipe } from '../../validation/validation.pipe';
import { ActorDto, ActorSchema } from '@overtheairbrew/models';
import { IdResponseDto } from '../../id.response.dto';
import { ActorsService } from './actors.service';

/* istanbul ignore start */
@ApiTags('actors')
@Controller('/actors')
export class ActorsController {
  /* istanbul ignore stop */
  constructor(private readonly actorService: ActorsService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: IdResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodBodyValidationPipe(ActorSchema))
  async createActor(@Body() createActorDto: ActorDto) {
    const response = await this.actorService.createActor(createActorDto);
    return response;
  }
}
