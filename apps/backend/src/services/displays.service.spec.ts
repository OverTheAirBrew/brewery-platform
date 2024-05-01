import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../data/data.abstractions';
import { IdResponseDto } from '../id.response.dto';
import { DisplaysService } from './displays.service';

describe('DisplaysService', () => {
  let displaysService: DisplaysService;

  const mockDisplayRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DisplaysService,
        {
          provide: REPOSITORIES.DisplayRepository,
          useValue: mockDisplayRepository,
        },
      ],
    }).compile();

    displaysService = module.get<DisplaysService>(DisplaysService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createDisplay', () => {
    beforeEach(() => {
      mockDisplayRepository.create.mockResolvedValue({ id: 'id' });
    });

    it('should return an IdResponseDto', async () => {
      const result = await displaysService.createDisplay({
        name: 'name',
        deviceCode: 'deviceCode',
      });

      expect(mockDisplayRepository.create).toHaveBeenCalledWith({
        name: 'name',
        deviceCode: 'deviceCode',
      });

      expect(result).toMatchObject({ id: 'id' });
      expect(result).toBeInstanceOf(IdResponseDto);
    });
  });

  describe('getDisplays', () => {
    beforeEach(() => {
      mockDisplayRepository.findAll.mockResolvedValue([
        {
          id: 'id',
          name: 'name',
          deviceCode: 'deviceCode',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it('should return an array of displays', async () => {
      const result = await displaysService.getDisplays();
      expect(result).toMatchObject([
        {
          id: 'id',
          name: 'name',
          deviceCode: 'deviceCode',
        },
      ]);
    });
  });

  describe('getDisplayInformationByCode', () => {
    beforeEach(() => {
      mockDisplayRepository.findOne.mockResolvedValue({
        id: 'id',
        name: 'name',
        deviceCode: 'deviceCode',
        tap_id: 'tap_id',
        tap: {
          keg_id: 'keg_id',
          keg: {
            beverage_id: 'beverage_id',
            beverage: {
              id: 'beverage-id',
              name: 'name',
              description: 'description',
              style: 'style',
              abv: 1,
              producer: {
                id: 'producer-id',
                name: 'producer-name',
              },
            },
          },
        },
      });
    });

    it('should return display information if the display is set up', async () => {
      const result =
        await displaysService.getDisplayInformationByCode('deviceCode');

      expect(result).toMatchObject({
        status: 'COMPLETE',
        beverage: {
          id: 'beverage-id',
          name: 'name',
          producer: 'producer-name',
        },
      });
    });

    it('should return an unregistered status if the display is not found', async () => {
      mockDisplayRepository.findOne.mockResolvedValue(null);

      const result =
        await displaysService.getDisplayInformationByCode('deviceCode');

      expect(result).toMatchObject({
        status: 'UNREGISTERED',
      });
    });

    it('should return a tap unassigned status if the display has no tap', async () => {
      mockDisplayRepository.findOne.mockResolvedValue({
        id: 'id',
        name: 'name',
        deviceCode: 'deviceCode',
      });

      const result =
        await displaysService.getDisplayInformationByCode('deviceCode');

      expect(result).toMatchObject({
        status: 'TAPUNASSIGNED',
      });
    });

    it('should return a no beverage status if the tap has no keg', async () => {
      mockDisplayRepository.findOne.mockResolvedValue({
        id: 'id',
        name: 'name',
        deviceCode: 'deviceCode',
        tap_id: 'tap_id',
        tap: {},
      });

      const result =
        await displaysService.getDisplayInformationByCode('deviceCode');

      expect(result).toMatchObject({
        status: 'NOBEVERAGE',
      });
    });
  });
});
