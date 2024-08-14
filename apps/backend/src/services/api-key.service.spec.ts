import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../data/data.abstractions';
import { ApiKeyService } from './api-key.service';

const mockApiKeyRepository = {
  create: jest.fn(),
  count: jest.fn(),
};

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: REPOSITORIES.ApiKeyRepository,
          useValue: mockApiKeyRepository,
        },
      ],
    }).compile();

    apiKeyService = module.get<ApiKeyService>(ApiKeyService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createApiKey', () => {
    beforeEach(() => {
      mockApiKeyRepository.create.mockImplementation(async (data) => data);
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
      mockApiKeyRepository.count.mockResolvedValue(1);
      const result = await apiKeyService.validateApiKey('key');
      expect(result).toBeTruthy();
    });

    it('should return false if there is no matching key', async () => {
      mockApiKeyRepository.count.mockResolvedValue(0);
      const result = await apiKeyService.validateApiKey('key');
      expect(result).toBeFalsy();
    });
  });
});
