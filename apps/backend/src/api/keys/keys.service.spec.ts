import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../../data/data.abstractions';
import { KeysService } from './keys.service';

const mockApiKeyRepository = {
  create: jest.fn(),
  count: jest.fn(),
  findByPk: jest.fn(),
};

describe('KeysService', () => {
  let apiKeyService: KeysService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KeysService,
        {
          provide: REPOSITORIES.ApiKeyRepository,
          useValue: mockApiKeyRepository,
        },
      ],
    }).compile();

    apiKeyService = module.get<KeysService>(KeysService);
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

  describe('regenerateApiKey', () => {
    it('should regenerate the api key', async () => {
      const mockUpdate = jest.fn().mockImplementation(async (data) => data);
      const mockSave = jest.fn().mockResolvedValue({});

      mockApiKeyRepository.findByPk.mockResolvedValue({
        key: 'testing-key',
        name: 'testing',
        id: 'id',
        update: mockUpdate,
        save: mockSave,
      });

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
      mockApiKeyRepository.findByPk.mockResolvedValue(null);

      await expect(apiKeyService.regenerateApiKey('id')).rejects.toThrow(
        'Api Key with id id does not exist',
      );
    });
  });
});
