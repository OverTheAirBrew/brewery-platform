import { Inject, Injectable } from '@nestjs/common';
import { ApiKeySchema } from '@overtheairbrew/models';
import generateApiKey from 'generate-api-key';
import { REPOSITORIES } from '../data/data.abstractions';
import { ApiKey } from '../data/entities/api-key.entity';
import { ApiKeyDoesNotExistError } from '../errors/api-key-does-not-exist-error';

@Injectable()
export class ApiKeyService {
  constructor(
    @Inject(REPOSITORIES.ApiKeyRepository)
    private apiKeyRepository: typeof ApiKey,
  ) {}

  async createApiKey(name: string) {
    const apiKey = await this.generateNewApiKey();
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

  async regenerateApiKey(id: string) {
    const apiKey = await this.apiKeyRepository.findByPk(id);
    if (!apiKey) throw new ApiKeyDoesNotExistError(id);
    await apiKey.update({
      key: await this.generateNewApiKey(),
    });
    await apiKey.save();
    return ApiKeySchema.parse(apiKey);
  }

  private async generateNewApiKey() {
    return generateApiKey({ length: 32, prefix: 'OTA_' }).toString();
  }
}
