import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/public.decorator';
import { ActorTypesService } from './actor-types.service';

@ApiTags('actor-types')
@Controller('/actor-types')
// @ApiBearerAuth()
export class ActorTypesController {
  constructor(private readonly actorTypesService: ActorTypesService) {}

  @Public()
  @Get('/:deviceId')
  async getActorTypes(@Param('deviceId') device_id: string) {
    const actors = await this.actorTypesService.getActorTypes(device_id);
    return actors;
  }
}
