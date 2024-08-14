import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../data/data.abstractions';
import { BeveragesService } from './beverages.service';

describe('BeveragesService', () => {
  let beveragesService: BeveragesService;

  const mockRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BeveragesService,
        {
          provide: REPOSITORIES.BeverageRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    beveragesService = module.get<BeveragesService>(BeveragesService);
  });

  describe('createBeverage', () => {
    beforeEach(() => {
      mockRepository.create.mockResolvedValue({ id: 'id' });
    });

    it('should return an IdResponseDto', async () => {
      const result = await beveragesService.createBeverage({
        name: 'name',
        producer_id: 'producer_id',
        description: 'description',
        style: 'style',
        abv: 5,
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'name',
        producer_id: 'producer_id',
        abv: 5,
        description: 'description',
        style: 'style',
      });

      expect(result).toMatchObject({ id: 'id' });
    });
  });

  describe('getAllBeverages', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([
        {
          name: 'name',
          producer_id: 'producer_id',
          description: 'description',
          style: 'style',
          abv: 5,
        },
      ]);
    });

    it('should return an array of BeverageDto', async () => {
      const result = await beveragesService.getAllBeverages();

      expect(mockRepository.findAll).toHaveBeenCalled();

      expect(result).toEqual([
        {
          name: 'name',
          producer_id: 'producer_id',
          description: 'description',
          style: 'style',
          abv: 5,
        },
      ]);
    });
  });

  describe('getOneBeverage', () => {
    beforeEach(() => {
      mockRepository.findByPk.mockResolvedValue({
        name: 'name',
        producer_id: 'producer_id',
        description: 'description',
        style: 'style',
        abv: 5,
      });
    });

    it('should return a BeverageDto', async () => {
      const result = await beveragesService.getOneBeverage('id');

      expect(mockRepository.findByPk).toHaveBeenCalledWith('id');

      expect(result).toEqual({
        name: 'name',
        producer_id: 'producer_id',
        description: 'description',
        style: 'style',
        abv: 5,
      });
    });
  });

  describe('updateBeverage', () => {
    it('should update a beverage', async () => {
      const mockUpdate = jest.fn();
      const mockSave = jest.fn();

      mockRepository.findByPk.mockResolvedValue({
        update: mockUpdate,
        save: mockSave,
      });

      await beveragesService.updateBeverage('id', {
        name: 'name',
        producer_id: 'producer_id',
        description: 'description',
        style: 'style',
        abv: 5,
      });

      expect(mockRepository.findByPk).toHaveBeenCalledWith('id');

      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'name',
        producer_id: 'producer_id',
        description: 'description',
        style: 'style',
        abv: 5,
      });

      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw an error if the beverage does not exist', async () => {
      mockRepository.findByPk.mockResolvedValue(null);

      await expect(
        beveragesService.updateBeverage('id', {
          name: 'name',
          producer_id: 'producer_id',
          description: 'description',
          style: 'style',
          abv: 5,
        }),
      ).rejects.toThrow('Beverage with id id does not exist');
    });
  });
});
