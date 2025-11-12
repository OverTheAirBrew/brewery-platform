import { sync } from 'fast-glob';
import { existsSync, readFileSync } from 'fs';

import { DS18B20Controller } from './ds18b20';

jest.mock('fs');
jest.mock('fast-glob');

const globSyncStub = jest.mocked(sync, { shallow: true });
const existsSyncStub = jest.mocked(existsSync, { shallow: true });
const readFileSyncStub = jest.mocked(readFileSync, { shallow: true });

describe('mechanisms/ds18b20', () => {
  let service: DS18B20Controller;

  beforeEach(() => {
    service = new DS18B20Controller();
  });

  describe('findDevices', () => {
    it('should return a list of found devices', async () => {
      globSyncStub.mockReturnValue([
        '/sys/bus/w1/devices/28-23123123123',
        '/sys/bus/w1/devices/28-23123125352',
      ]);

      const devices = await service.findDevices();

      expect(devices).toMatchObject(['28-23123123123', '28-23123125352']);
    });
  });

  describe('getCurrentValue', () => {
    it('should return a value if the device exists', async () => {
      existsSyncStub.mockReturnValue(true);
      readFileSyncStub.mockReturnValue(`3e 01 4b 46 7f ff 02 10 6c : crc=6c YES
      3e 01 4b 46 7f ff 02 10 6c t=19875`);

      const temperature = await service.getCurrentValue('12345');
      expect(temperature.celsius).toEqual(19.875);
    });

    it('should throw an error if the device is not found', async () => {
      existsSyncStub.mockReturnValue(false);

      try {
        await service.getCurrentValue('12345');
        fail('should throw an error');
      } catch (err: any) {
        expect(err.message).toBe('One wire device not found');
      }
    });

    it('should error if the data is in an incorrect format', async () => {
      existsSyncStub.mockReturnValue(true);
      readFileSyncStub.mockReturnValue(
        `3e 01 4b 46 7f ff 02 10 6c : crc=6c YES`,
      );

      try {
        await service.getCurrentValue('12345');
        fail('should throw an error');
      } catch (err: any) {
        expect(err.message).toBe('Raw data is not in the expected format');
      }
    });
  });
});
