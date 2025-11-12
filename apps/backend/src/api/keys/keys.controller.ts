import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyDto } from '@overtheairbrew/models';
import { KeysService } from './keys.service';

@Controller('api-keys')
@ApiTags('api-key')
@ApiBearerAuth()
export class KeysController {
  constructor(private keysService: KeysService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async createApiKey(@Body() body: { name: string }) {
    return this.keysService.createApiKey(body.name);
  }

  @Patch('/:apiKeyId')
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async regenerateApiKey(@Param('apiKeyId') apiKeyId: string) {
    return await this.keysService.regenerateApiKey(apiKeyId);
  }
}
