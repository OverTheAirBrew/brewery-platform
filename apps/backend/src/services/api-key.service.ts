import { Inject, Injectable } from '@nestjs/common';
import { ApiKeySchema } from '@overtheairbrew/models';
import generateApiKey from 'generate-api-key';
import { REPOSITORIES } from '../data/data.abstractions';
import { ApiKey } from '../data/entities/api-key.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @Inject(REPOSITORIES.ApiKeyRepository)
    private apiKeyRepository: typeof ApiKey,
  ) {}

  async createApiKey(name: string) {
    const apiKey = generateApiKey({ length: 32, prefix: 'OTA_' });
    const key = await this.apiKeyRepository.create({
      name,
      key: apiKey.toString(),
    });

    return ApiKeySchema.parse(key);
  }

  async validateApiKey(key: string) {
    const apiKeyValid = await this.apiKeyRepository.count({
      where: {
        key: key,
      },
    });

    return apiKeyValid > 0;
  }
}
