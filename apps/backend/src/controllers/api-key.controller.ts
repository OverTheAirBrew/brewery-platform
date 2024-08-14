import { Body, Controller, Post } from '@nestjs/common';
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
}
