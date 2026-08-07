import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../../data/data.abstractions';
import { ApiKeysService } from './api-keys.service';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Mocked, TestBed } from '@suites/unit';
import { ApiKey } from '../../data/entities/api-key.entity';

describe('ApiKeysService', () => {
  let apiKeyService: ApiKeysService;
  let mockApiKeyRepository: Mocked<typeof ApiKey>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(ApiKeysService).compile();

    apiKeyService = unit;

    mockApiKeyRepository = unitRef.get<typeof ApiKey>(
      REPOSITORIES.ApiKeyRepository,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createApiKey', () => {
    beforeEach(() => {
      mockApiKeyRepository.create.mockImplementation(async (data: any) => data);
    });

    it('should create a new api key', async () => {
      const result = await apiKeyService.createApiKey('testing');

      expect(result.key).toStrictEqual(expect.stringContaining('OTA_'));
      expect(mockApiKeyRepository.create).toHaveBeenCalledWith({
        name: 'testing',
        key: expect.any(String),
      });
    });
  });

  describe('validateApiKey', () => {
    it('should return true if there is a matching key', async () => {
      void mockApiKeyRepository.count.mockResolvedValue(1);
      const result = await apiKeyService.validateApiKey('key');
      expect(result).toBeTruthy();
    });

    it('should return false if there is no matching key', async () => {
      void mockApiKeyRepository.count.mockResolvedValue(0);
      const result = await apiKeyService.validateApiKey('key');
      expect(result).toBeFalsy();
    });
  });

  describe('regenerateApiKey', () => {
    it('should regenerate the api key', async () => {
      const mockUpdate = vi.fn().mockImplementation(async (data) => data);
      const mockSave = vi.fn().mockResolvedValue({});

      void mockApiKeyRepository.findByPk.mockResolvedValue({
        key: 'testing-key',
        name: 'testing',
        id: 'id',
        update: mockUpdate,
        save: mockSave,
      } as any);

      await apiKeyService.regenerateApiKey('id');

      expect(mockApiKeyRepository.findByPk).toHaveBeenCalledWith('id');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.not.stringContaining('testing-key'),
        }),
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should error if the api key does not exist to regenerate', async () => {
      void mockApiKeyRepository.findByPk.mockResolvedValue(null);

      await expect(apiKeyService.regenerateApiKey('id')).rejects.toThrow(
        'Key with id id does not exist',
      );
    });
  });
});
