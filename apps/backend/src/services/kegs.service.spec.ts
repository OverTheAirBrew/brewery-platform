import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../data/data.abstractions';
import { IdResponseDto } from '../id.response.dto';
import { KegsService } from './kegs.service';

describe('KegsService', () => {
  let kegsService: KegsService;

  const mockRepository = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KegsService,
        {
          provide: REPOSITORIES.KegRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    kegsService = module.get<KegsService>(KegsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createKeg', () => {
    beforeEach(() => {
      mockRepository.create.mockResolvedValue({ id: 'id' });
    });

    it('should return an IdResponseDto', async () => {
      const result = await kegsService.createKeg({
        beverage_id: 'beverage_id',
        type: 'type',
        status: 'IN_STOCK',
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        beverage_id: 'beverage_id',
        type: 'type',
        status: 'IN_STOCK',
      });

      expect(result).toMatchObject({ id: 'id' });
      expect(result).toBeInstanceOf(IdResponseDto);
    });
  });

  describe('getAllKegs', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([
        {
          beverage_id: 'beverage_id',
          type: 'type',
          status: 'IN_STOCK',
        },
      ]);
    });

    it('should return an array of KegDto', async () => {
      const result = await kegsService.getAllKegs();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        beverage_id: 'beverage_id',
        type: 'type',
        status: 'IN_STOCK',
      });
    });
  });

  describe('getOneKeg', () => {
    beforeEach(() => {
      mockRepository.findByPk.mockResolvedValue({
        beverage_id: 'beverage_id',
        type: 'type',
        status: 'IN_STOCK',
      });
    });

    it('should return a KegDto', async () => {
      const result = await kegsService.getOneKeg('id');

      expect(mockRepository.findByPk).toHaveBeenCalledWith('id');
      expect(result).toMatchObject({
        beverage_id: 'beverage_id',
        type: 'type',
        status: 'IN_STOCK',
      });
    });
  });
});
