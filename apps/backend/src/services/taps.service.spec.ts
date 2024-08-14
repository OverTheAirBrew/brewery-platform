import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../data/data.abstractions';
import { TapsService } from './taps.service';

describe('TapsService', () => {
  let tapService: TapsService;

  const mockRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TapsService,
        {
          provide: REPOSITORIES.TapRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    tapService = module.get<TapsService>(TapsService);
  });

  describe('createTap', () => {
    beforeEach(() => {
      mockRepository.create.mockResolvedValue({ id: 'id' });
    });

    it('should return an IdResponseDto', async () => {
      const result = await tapService.createTap({
        name: 'name',
      });

      expect(mockRepository.create).toHaveBeenCalledWith({ name: 'name' });

      expect(result).toMatchObject({ id: 'id' });
    });
  });

  describe('getAllTaps', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([
        {
          name: 'name',
        },
      ]);
    });

    it('should return an array of TapDto', async () => {
      const result = await tapService.getAllTaps();

      expect(result).toMatchObject([{ name: 'name' }]);
    });
  });

  describe('getOneTap', () => {
    beforeEach(() => {
      mockRepository.findByPk.mockResolvedValue({
        name: 'name',
      });
    });

    it('should return a TapDto', async () => {
      const result = await tapService.getOneTap('id');

      expect(result).toMatchObject({ name: 'name' });
    });
  });
});
