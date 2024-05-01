import { Test } from '@nestjs/testing';
import { Device, DeviceIdentifier } from '@overtheairbrew/plugins';
import { DeviceTypesService } from './device-types.service';

describe('DeviceTypesService', () => {
  let deviceTypesService: DeviceTypesService;

  const mockDevices: Partial<Device<any>>[] = [
    {
      name: 'device1',
      getConfigOptions: jest.fn().mockResolvedValue([]),
    },
  ];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeviceTypesService,
        {
          provide: DeviceIdentifier,
          useValue: mockDevices,
        },
      ],
    }).compile();

    deviceTypesService = module.get<DeviceTypesService>(DeviceTypesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getAll', () => {
    it('should return an array of device types', async () => {
      const result = await deviceTypesService.getAll();
      expect(result).toMatchObject([
        {
          name: 'device1',
          properties: expect.any(Array),
        },
      ]);
    });
  });
});
