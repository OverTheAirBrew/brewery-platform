import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyDto } from '@overtheairbrew/models';
import { ApiKeyService } from '../services/api-key.service';

@Controller('api-keys')
@ApiTags('api-key')
@ApiBearerAuth()
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post('/')
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async createApiKey(@Body() body: { name: string }) {
    return this.apiKeyService.createApiKey(body.name);
  }

  @Patch('/:apiKeyId')
  @ApiCreatedResponse({
    type: ApiKeyDto,
  })
  async regenerateApiKey(@Param('apiKeyId') apiKeyId: string) {
    return await this.apiKeyService.regenerateApiKey(apiKeyId);
  }
}
