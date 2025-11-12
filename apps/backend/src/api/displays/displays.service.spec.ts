import { Test } from '@nestjs/testing';
import { REPOSITORIES } from '../../data/data.abstractions';
import { DisplayDoesNotExistError } from '../errors/display-does-not-exist-error';
import { IdResponseDto } from '../../id.response.dto';
import {
  mockEventsGatewayProvider,
  mockSendMessage,
} from '../../test-utils/mock-events-gateway';
import { DisplaysService } from './displays.service';

describe('DisplaysService', () => {
  let displaysService: DisplaysService;

  const mockRepository = {
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
          useValue: mockRepository,
        },
        mockEventsGatewayProvider,
      ],
    }).compile();

    displaysService = module.get<DisplaysService>(DisplaysService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createDisplay', () => {
    beforeEach(() => {
      mockRepository.create.mockResolvedValue({ id: 'id' });
      mockSendMessage.mockResolvedValue({});
    });

    it('should return an IdResponseDto', async () => {
      const result = await displaysService.createDisplay({
        name: 'name',
        deviceCode: 'deviceCode',
      });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'name',
        deviceCode: 'deviceCode',
      });

      expect(result).toMatchObject({ id: 'id' });
      expect(result).toBeInstanceOf(IdResponseDto);
    });
  });

  describe('getDisplays', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([
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
      mockRepository.findOne.mockResolvedValue({
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
      mockRepository.findOne.mockResolvedValue(null);

      const result =
        await displaysService.getDisplayInformationByCode('deviceCode');

      expect(result).toMatchObject({
        status: 'UNREGISTERED',
      });
    });

    it('should return a tap unassigned status if the display has no tap', async () => {
      mockRepository.findOne.mockResolvedValue({
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
      mockRepository.findOne.mockResolvedValue({
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

  describe('updateDisplay', () => {
    it('should update the display', async () => {
      const mockUpdate = jest.fn();
      const mockSave = jest.fn();

      mockRepository.findByPk.mockResolvedValue({
        update: mockUpdate,
        save: mockSave,
      });

      await displaysService.updateDisplay('id', {
        name: 'newName',
        deviceCode: 'newDeviceCode',
      });

      expect(mockRepository.findByPk).toHaveBeenCalledWith('id');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'newName',
        deviceCode: 'newDeviceCode',
      });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw an error if the display does not exist', async () => {
      mockRepository.findByPk.mockResolvedValue(null);

      await expect(
        displaysService.updateDisplay('id', {
          name: 'newName',
          deviceCode: 'newDeviceCode',
        }),
      ).rejects.toThrow(DisplayDoesNotExistError);
    });
  });
});
